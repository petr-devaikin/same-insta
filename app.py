from flask import Flask, render_template, request, url_for, redirect, session, jsonify
from downloader.downloader import Downloader
import requests, os, urllib2, io
from instagram import client
from perception.advanced import SimplePerception
from PIL import Image
from recognition.faces import get_faces, get_faces_from_file

app = Flask(__name__, instance_relative_config=True)
app.config.from_object('default_settings')
app.config.from_pyfile('application.cfg', silent=True)

app.secret_key = os.urandom(24)

simple_perception = SimplePerception(8, 8)


def get_unauthenticated_api(**kwargs):
    return client.InstagramAPI(client_id=app.config['INSTA_ID'],
                               client_secret=app.config['INSTA_SECRET'],
                               redirect_uri=url_for('insta_code', _external=True, **kwargs))


def calc_hash(media, perception):
    for m in media:
        fd = urllib2.urlopen(m.images['thumbnail'].url)
        image_file = io.BytesIO(fd.read())
        img = Image.open(image_file)
        m.hash = perception.get_hash(img)


@app.route('/tag/<tag>')
def tags(tag):
    access_token = session.get('access_token')
    if not access_token: return redirect(url_for('login', ret=request.url))

    return render_template('tags.html', tag=tag)


@app.route('/faces')
def faces():
    access_token = session.get('access_token')
    if not access_token: return redirect(url_for('login', ret=request.url))

    return render_template('faces.html')


@app.route('/next_images')
def next_images():
    access_token = session.get('access_token')
    if not access_token: return jsonify(error='session expired')

    insta = client.InstagramAPI(access_token=access_token)

    tag = request.args.get('tag')
    params = { 'count': app.config['IMAGES_PER_REQUEST'] }

    if request.args.get('next'):
        params['with_next_url'] = request.args.get('next')
    elif tag:
        params['tag_name'] = tag

    media, next_ = insta.tag_recent_media(**params) if tag else insta.user_recent_media(**params)

    result = []
    for m in media:
        faces = get_faces(m.get_thumbnail_url())
        if len(faces) > 0:
            result.append({
                'link': m.link, 
                'img': m.get_thumbnail_url(),
                'faces': [(int(x), int(y), int(w), int(h)) for (x, y, w, h) in faces]
            })

    return jsonify(images=result, next_url=next_)

@app.route('/test')
def test():
    return render_template('test.html')


@app.route('/login')
def login():
    return redirect(get_unauthenticated_api(ret=request.args.get('ret')).get_authorize_url())


@app.route('/insta_code')
def insta_code():
    code = request.args.get('code')
    return_url = request.args.get('ret')
    try:
        access_token, user_info = get_unauthenticated_api(ret=return_url).exchange_code_for_access_token(code)
        session['access_token'] = access_token
        return redirect(return_url)
    except Exception as e:
        print e
        return 'error'

if __name__ == '__main__':
    app.run(threaded=True)