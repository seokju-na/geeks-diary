#!/usr/bin/env bash

rm -rf src/assets/vendors/
mkdir -p src/assets/vendors/


# Copy devicon
mkdir -p src/assets/vendors/devicon/
cp -R node_modules/devicon-2.2/icons/ src/assets/vendors/devicon/
cp node_modules/devicon-2.2/devicon.json src/assets/vendors/devicon/devicon.json
cp node_modules/devicon-2.2/devicon.min.css src/assets/vendors/devicon/devicon.min.css
