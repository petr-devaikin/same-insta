from PIL import Image
from .image_hash import ImageHash

class BasePerception(object):
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def _convert_pixel(self, pixel):
        return pixel[0]

    def _get_converter(self, line):
        return lambda pixel: self._convert_pixel(pixel)

    def get_hash(self, image_path):
        image = Image.open(image_path)
        small_image = image.resize((self.width, self.height), Image.ANTIALIAS)
        line = [small_image.getpixel((x, y)) for x in range(self.width) for y in range(self.height)]
        return ImageHash(map(self._get_converter(line), line))