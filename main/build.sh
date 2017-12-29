#!/bin/sh

# cleanup
rm public/*.js.map

# build
npm run build

# zip
zip -r MoFace.zip public