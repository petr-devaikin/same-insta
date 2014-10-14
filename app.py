from flask import Flask, render_template, request, url_for, redirect, session
from downloader.downloader import Downloader
import requests, os, urllib2, io
from instagram import client
from perception.advanced import SimplePerception
from PIL import Image
from faces import get_faces

app = Flask(__name__, instance_relative_config=True)
app.config.from_object('default_settings')
app.config.from_pyfile('application.cfg', silent=True)

app.secret_key = os.urandom(24)

simple_perception = SimplePerception(8, 8)

def get_unauthenticated_api():
    return client.InstagramAPI(client_id=app.config['INSTA_ID'],
                               client_secret=app.config['INSTA_SECRET'],
                               redirect_uri=url_for('.insta_code', _external=True))

def calc_hash(media, perception):
    for m in media:
        fd = urllib2.urlopen(m.images['thumbnail'].url)
        image_file = io.BytesIO(fd.read())
        img = Image.open(image_file)
        m.hash = perception.get_hash(img)


@app.route('/')
@app.route('/<int:user_id>')
def index(user_id=None):
    access_token = session.get('access_token')
    if not access_token:
        return redirect(url_for('.login'))
    
    d = Downloader(access_token=access_token)

    insta_client = client.InstagramAPI(access_token=access_token)
    
    followers, next_ = insta_client.user_followed_by(user_id=user_id)
    while next_:
        next_followers, next_ = insta_client.user_followed_by(with_next_url=next_)
        followers += next_followers

    my_images = d.grab_images(user_id)
    calc_hash(my_images, simple_perception)

    res = []

    for f in followers:
        f_images = d.grab_images(f.id)
        calc_hash(f_images, simple_perception)
        for m1 in my_images:
            for m2 in f_images:
                if m1.hash * m2.hash >= 0.95:
                    res.append((m1, m2))
    
    return ''.join(['<img src="{0}" /><img src="{1}" /><br/>'.format(r[0].images['thumbnail'].url, r[1].images['thumbnail'].url) for r in res])

    #return str(len([f.id for f in followers]))

    #media = d.grab_images(user_id) #48217801
    #for m in media[:10]:
    #    f = cStringIO.StringIO(urllib.urlopen(m.images['thumbnail'].url).read())
    #    img = Image.open(f)
    #    m.hash = p.get_hash(img)
        

    #return ''.join(['<img src="{0}" />'.format(m.images['thumbnail'].url) for m in media])
    #return ''.join(['<img src="{0}" />{1}<br/>'.format(m.images['thumbnail'].url, m.hash) for m in media[0:10]])

@app.route('/faces')
def faces():
    access_token = session.get('access_token')
    if not access_token:
        return redirect(url_for('.login'))

    d = Downloader(access_token=access_token)
    my_images = d.grab_images(None)
    for m in my_images:
        m.faces = get_faces(m.images['thumbnail'].url)

    return ''.join(['<img src="{0}" />{1}<br/>'.format(m.images['thumbnail'].url, len(m.faces)) for m in my_images])


@app.route('/login')
def login():
    return redirect(get_unauthenticated_api().get_authorize_url())


@app.route('/insta_code')
def insta_code():
    code = request.args.get('code')
    try:
        access_token, user_info = get_unauthenticated_api().exchange_code_for_access_token(code)
        session['access_token'] = access_token
        return redirect(url_for('faces'))
    except Exception as e:
        print e
        return 'error'

if __name__ == '__main__':
    app.run()