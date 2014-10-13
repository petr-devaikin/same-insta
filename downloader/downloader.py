from instagram.client import InstagramAPI
from instagram.helper import datetime_to_timestamp
from instagram.bind import InstagramAPIError, InstagramClientError

class Downloader(object):
    def __init__(self, **kwargs):
        self._api = InstagramAPI(**kwargs)

    def grab_images(self, user_id):
        all_media = []
        max_id = None
        while True:
            recent_media, next_ = self._api.user_recent_media(user_id=user_id, max_id=max_id, count=100)
            if recent_media:
                all_media += recent_media
                new_max_id = recent_media[-1].id
                if new_max_id != max_id:
                    max_id = new_max_id
                else:
                    break
            else:
                break
        return all_media
