#: /usr/bin

serverPort="13531"
imagedir="project/resources/imgdoc/"
bookdir="project/resources/doc/"
audiodir="project/resources/audio/"
videodir="project/resources/video/"

echo "Have you placed all files into $(realpath $bookdir) properly?"
cd project/tools;
python3 lspdf.py $bookdir || echo " ! You must have  python3 in your  \$PATH and permit it to run in this program...  "
python3 lsimg.py $imagedir || echo " ! You are suggested to place some images into $(realpath $imagedir) as the pages of a default document ...  "
python3 lsaudio.py $audiodir || echo " ! You are suggested to place some audio files into $(realpath $audiodir)  ...  "
python3 lsvideo.py $videodir || echo " ! You are suggested to place some audio files into $(realpath $videodir)  ...  "
cd ..

echo ;
echo "Try opening your browser and visiting:  http://localhost:$serverPort"
python3 -m http.server $serverPort

