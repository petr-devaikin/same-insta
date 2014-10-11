from flask import Flask, render_template, request, url_for, redirect, session
from downloader.downloader import Downloader
import requests, os
from instagram import client

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

    d = Downloader(access_token=access_token)
    media = d.grab_images(user_id) #48217801
    return ''.join(['<img src="{0}" />'.format(m) for m in media])

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