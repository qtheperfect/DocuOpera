import os
import sys
import re

allFiles = os.listdir(sys.argv[1])
allFiles.sort()

allFiles = [ "project/" + sys.argv[1] + "/" +  a for a in allFiles ]
listStr = "var audioArray = " + str(allFiles) + ";\n"

f = open("src/audiolist.js", "w+")
f.write( listStr )
f.close()



