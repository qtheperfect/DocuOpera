#: /usr/bin

serverPort="13531"
imagedir="./resources/imgdoc/"
bookdir="./resources/doc/"

echo "Have you placed all files into $(realpath $bookdir) properly?"
cd tools;
python3 lspdf.py $bookdir || echo " ! You must have  python3 in your  \$PATH and  allow it  to run in this program...  "
python3 lsimg.py $imagedir || echo " ! You are suggested to place some images into $imagedir as the pages of a default document ...  "
cd ..

echo ;
echo "Try opening your browser and visiting:  http://localhost:$serverPort"
python3 -m http.server $serverPort

