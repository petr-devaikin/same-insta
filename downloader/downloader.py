from instagram.client import InstagramAPI
from instagram.helper import datetime_to_timestamp
from instagram.bind import InstagramAPIError, InstagramClientError

class Downloader(object):
    def __init__(self, **kwargs):
        self._api = InstagramAPI(**kwargs)

    def grab_images(self, user_id):
        recent_media, next = self._api.user_recent_media(user_id=user_id)
        print recent_media
        return [media.images['thumbnail'].url for media in recent_media]
