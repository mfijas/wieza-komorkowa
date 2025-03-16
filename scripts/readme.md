

plik words_freq.txt zawiera słowa i ich częstości skopiowane z pliku https://web.archive.org/web/20091116122442/http://www.open-dictionaries.com/slownikfrleks.pdf

plik slowa.txt to slownik growy z https://sjp.pl/sl/growy/

2. plik odm.txt zawiera wszystkie wyrazy w słowniku aspell z odmianami, wygenerowany za pomocą:
aspell -d pl dump master | aspell -l pl expand > odm.txt





allWords -- słownik growy z https://sjp.pl/sl/growy/, slowa.txt
zawiera odmiane itp.

words -- 

growy przefiltrowany przez liste frekwencyjna
odfiltruj top N najpopularniejszych
wygeneruj odmiane aspellem
przefiltruj jeszcze raz przez slownik growy

