import os
import sys
import re

allFiles = os.listdir(sys.argv[1])
allFiles.sort()

allFiles = [ "project/" + sys.argv[1] + "/" +  a for a in allFiles]
listStr = "var videoArray = " + str(allFiles);

f = open("src/videolist.js", "w+")
f.write( listStr )
f.close()



