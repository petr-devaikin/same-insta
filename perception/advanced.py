from .base import BasePerception
from .image_hash import HueHash

class SimplePerception(BasePerception):
    def _convert_pixel(self, pixel):
        return (0.299 * pixel[0] + 0.587 * pixel[1] + 0.114 * pixel[2]) / 255

    def _get_converter(self, line):
        bw_line = [self._convert_pixel(pixel) for pixel in line]
        average = sum(bw_line) / self.width / self.height
        return lambda pixel: self._convert_pixel(pixel) > average


class HuePerception(BasePerception):
    _ResultClass = HueHash

    def _convert_pixel(self, pixel):
        r = pixel[0] / 255.0
        g = pixel[1] / 255.0
        b = pixel[2] / 255.0
        c_max = max((r, g, b))
        delta = c_max - min((r, g, b))
        if delta == 0:
            return None
        else:
            if r == c_max:
                hue = (g - b) / delta
            elif g == c_max:
                hue = 2 + (b - r) / delta
            else:
                hue = 4 + (r - g) / delta
            return hue * 60 if hue > 0 else hue * 60 + 360