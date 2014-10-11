from flask import Flask, render_template, request, url_for, redirect, session
from downloader.downloader import Downloader
import requests, os

app = Flask(__name__, instance_relative_config=True)
app.config.from_object('default_settings')
app.config.from_pyfile('application.cfg', silent=True)

app.secret_key = os.urandom(24)

@app.route('/')
def index():
    if 'access_token' not in session:
        return redirect(url_for('.login'))

    d = Downloader(access_token=session['access_token'])
    media = d.grab_images(48217801)
    return '<br/>'.join(['<img src="{0}" />'.format(m) for m in media])

@app.route('/login')
def login():
    return redirect(app.config['GET_CODE_URL'].format(app.config['INSTA_ID'],
                                                      url_for('.insta_code', _external=True)))


@app.route('/insta_code')
def insta_code():
    code = request.args.get('code', '')
    r = requests.post(app.config['TOKEN_URL'], {
            'client_id': app.config['INSTA_ID'],
            'client_secret': app.config['INSTA_SECRET'],
            'grant_type': 'authorization_code',
            'redirect_uri': url_for('.insta_code', _external=True),
            'code': code
        })
    access_token = r.json().get('access_token', '')
    if access_token:
        session['access_token'] = access_token
        return redirect(url_for('.index'))
    else:
        return 'error'

if __name__ == '__main__':
    app.run()