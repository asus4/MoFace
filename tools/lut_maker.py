#!/usr/bin/env python3
# coding: UTF-8

# https://gist.github.com/asus4/09b1f5403c63ceab5ae34710cbe2809e

import cv2
import numpy as np


def make_simpleRGmap(exportPath):
    ''' 256 Normal displacement '''
    colors = []
    for y in range(0, 256):
        rows = []
        for x in range(0, 256):
            rows.append([  # BGR
                0,  # blue
                256 - y,  # green
                x   # red
            ])
        colors.append(rows)

    image = np.array(colors)
    if exportPath:
        cv2.imwrite(exportPath, image)
    return image


if __name__ == '__main__':
    import argparse
    import sys
    parser = argparse.ArgumentParser(description='LUT Texture maker')
    parser.add_argument('path',
                        type=str,
                        nargs='?',
                        default='lut.png',
                        help='output filename')
    args = parser.parse_args()
    make_simpleRGmap(args.path)
