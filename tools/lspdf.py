import os
import sys
import re

allFiles = os.listdir(sys.argv[1])
allFiles.sort()

allFiles = [ "project/" + sys.argv[1] + "/" +  a for a in allFiles if ".pdf" in a ]
listStr = "var pdfList = " + str(allFiles);

f = open("src/pdflist.js", "w+")
f.write( listStr )
f.close()



