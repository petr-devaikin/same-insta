
class ImageHash(object):
    def __init__(self, values):
        self.values = values

    def __mul__(self, other):
        pairs = zip(self.values, other.values)
        equal = sum([a == b for a, b in pairs])
        return float(equal) / len(pairs)

    def __str__(self):
        return str(self.values)