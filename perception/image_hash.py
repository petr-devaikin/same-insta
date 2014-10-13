
class ImageHash(object):
    def __init__(self, values):
        self.values = values

    @staticmethod
    def _compare_values(a, b):
        return 1 - abs(a - b)

    def __mul__(self, other):
        pairs = zip(self.values, other.values)
        equal = sum([self._compare_values(a, b) for a, b in pairs])
        return float(equal) / len(pairs)

    def __str__(self):
        return str(self.values)


class HueHash(ImageHash):
    @staticmethod
    def _compare_values(a, b):
        if a == None and b == None:
            return 1
        elif a != None and b != None:
            d = abs(a - b)
            if d > 180: d = 360 - d
            return 1 - d / 180.0
        else:
            return 0
