#!/usr/bin/env bash

rm -rf package/src/assets/vendors/
mkdir -p package/src/assets/vendors/


# Copy devicon
mkdir -p package/src/assets/vendors/devicon/
cp -R node_modules/devicon-2.2/icons/ package/src/assets/vendors/devicon/
cp node_modules/devicon-2.2/devicon.json package/src/assets/vendors/devicon/devicon.json
cp node_modules/devicon-2.2/devicon.min.css package/src/assets/vendors/devicon/devicon.min.css
