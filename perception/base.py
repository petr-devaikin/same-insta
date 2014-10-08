from PIL import Image

class BasePerception(object):
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def _convert_pixel(self, pixel):
        return sum(pixel) / 3


    def _convert_line(self, line):
        average = sum(line) / self.width / self.height
        return [p > average for p in line]

    def get_hash(self, image_path):
        image = Image.open(image_path)
        small_image = image.resize((self.width, self.height), Image.ANTIALIAS)
        line = [self._convert_pixel(small_image.getpixel((x, y))) \
                                    for x in range(self.width) for y in range(self.height)]
        return self._convert_line(line)