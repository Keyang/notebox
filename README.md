# Note Box
Note box is a sqlite3 based database application which allows people create / search notes
under command line. It has following features:

* Any data acceptable including binary or files
* Password protection: AES256 encryption
* No overhead. Just drop in notes
* pipe in and pipe out
* Note search / full text search / tag based search

## Installation
```
npm install -g notebox
```

# CheatSheet (A way to notebox ninja)
## New note

```
nb n "this is my note"
```

Input multiple line

```
nb n
```

Input from a file

```
nb n < myfile

```

Set tags (separate by comma)

```
nb n -t tag1,tag2,tag3 "Hell world"
```

Store binary file with a title

```
nb n --title mypdf.pdf <mypdf.pdf
```
Use password to protect data

```
nb -n -p pwd "my data here"
```
or input password silently

```
nb -n "my data " -p
```

## Search note

```
nb s "word or phrase"
```
or by tags

```
nb s -t tag1,tag2
```

or by id

```
nb s --id <id>
```

remove all found items (find and remove)

```
nb s --delete
```

extract stored file

```
nb s --title mypdf.pdf -o raw > mypdf.pdf
```

extract password protected file

```
nb s --title mypic.png -p -o raw >mypic.png
```

## Others

Shrink DB file

```
nb sql "vacuum;"
```
