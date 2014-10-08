from PIL import Image

class BasePerception(object):
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def _get_line(self, small_image):
        grey_image = small_image.convert('L')
        line = [grey_image.getpixel((x, y)) for x in range(self.width) for y in range(self.height)]
        average = sum(line) / self.width / self.height
        return [p > average for p in line]

    def get_hash(self, image_path):
        image = Image.open(image_path)
        small_image = image.resize((self.width, self.height), Image.ANTIALIAS)
        return self._get_line(small_image)