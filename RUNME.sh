#!/bin/bash 

serverPort="13531"

rsdir="project/resources"

imagedir="$rsdir/imgdoc/"
bookdir="$rsdir/doc/"
audiodir="$rsdir/audio/"
videodir="$rsdir/video/"

echo "Have you placed all files into $(realpath $bookdir) properly?"
cd project/tools;
python3 lspdf.py $bookdir 2>/dev/null || echo " DOC_ERROR! You must have  python3 in your  \$PATH and permit it to run in this program...  "
python3 lsimg.py $imagedir 2>/dev/null  || echo " IMG_ERROR! You are suggested to place some images into $(realpath $imagedir) as the pages of a default document ...  "
python3 lsaudio.py $audiodir 2>/dev/null || echo " AUDIO_ERROR! You are suggested to place some audio files into $(realpath $audiodir)  ...  "
python3 lsvideo.py $videodir 2>/dev/null || echo " VIDEO_NOTFOUND! You are suggested to place some audio files into $(realpath $videodir)  ...  "
cd ..

echo ;
echo "Try opening your browser and visiting:  http://localhost:$serverPort"
python3 -m http.server $serverPort

