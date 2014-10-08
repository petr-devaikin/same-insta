from .base import BasePerception


class SimplePerception(BasePerception):
    def _convert_pixel(self, pixel):
        return sum(pixel) / 3

    def _get_converter(self, line):
        bw_line = [self._convert_pixel(pixel) for pixel in line]
        average = sum(bw_line) / self.width / self.height
        return lambda pixel: self._convert_pixel(pixel) > average


class HuePerception(BasePerception):
    def _convert_pixel(self, pixel):
        return pixel[0]