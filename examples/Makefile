all: got.svg simpsons.svg potter.svg farm.svg got.png simpsons.png potter.png modernfamily.png farm.png

open: all
	open *.svg -a "Google Chrome"

%.png: %.yml
	../bin/kingraph $^ -F png > $@
%.svg: %.yml
	../bin/kingraph $^ -F svg > $@
