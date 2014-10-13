from flask import Flask, render_template, request, url_for, redirect, session
from downloader.downloader import Downloader
import requests, os, urllib, cStringIO
from instagram import client
from perception.advanced import SimplePerception
from PIL import Image

app = Flask(__name__, instance_relative_config=True)
app.config.from_object('default_settings')
app.config.from_pyfile('application.cfg', silent=True)

app.secret_key = os.urandom(24)

def get_unauthenticated_api():
    return client.InstagramAPI(client_id=app.config['INSTA_ID'],
                               client_secret=app.config['INSTA_SECRET'],
                               redirect_uri=url_for('.insta_code', _external=True))

@app.route('/')
@app.route('/<int:user_id>')
def index(user_id=None):
    access_token = session.get('access_token')
    if not access_token:
        return redirect(url_for('.login'))

    p = SimplePerception(8, 8)
    d = Downloader(access_token=access_token)
    media = d.grab_images(user_id) #48217801
    #for m in media[:10]:
    #    f = cStringIO.StringIO(urllib.urlopen(m.images['thumbnail'].url).read())
    #    img = Image.open(f)
    #    m.hash = p.get_hash(img)
        
    return ''.join(['<img src="{0}" />'.format(m.images['thumbnail'].url) for m in media])
    #return ''.join(['<img src="{0}" />{1}<br/>'.format(m.images['thumbnail'].url, m.hash) for m in media[0:10]])

@app.route('/login')
def login():
    return redirect(get_unauthenticated_api().get_authorize_url())


@app.route('/insta_code')
def insta_code():
    code = request.args.get('code')
    try:
        access_token, user_info = get_unauthenticated_api().exchange_code_for_access_token(code)
        session['access_token'] = access_token
        return redirect(url_for('.index'))
    except Exception as e:
        print e
        return 'error'

if __name__ == '__main__':
    app.run()