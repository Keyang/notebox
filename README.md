# Note Box
Note box is a sqlite3 based Node.JS application which helps taking notes
in command line. It has following features:

* Completely Offline.
* Note tags.
* Password protection: AES256 encryption
* Simple Commands
* PIPE and Stream Support
* full text search / tag based search
* Single db file. easy to backup and migrate.

## Installation
```
npm install -g notebox
```

# CheatSheet (A way to notebox ninja)
## New note

```
nb n "this is my note"
```

Multiple line note

```
nb n
```

Stream data from a file

```
nb n < myfile

```

Set tags (separated by comma)

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

Simple text match

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

list all note

```
nb s
```

remove all found items (find and remove)

```
nb s -t personal_tag --delete
```

extract stored file

```
nb s mypdf.pdf -o raw > mypdf.pdf
```

export a password protected file

```
nb s mypic.png -p -o raw >mypic.png
```

## Update

Use $EDITOR to change note data.

```
nb u <id>
```
Update password

```
nb u <id> -p
```

## Note Editor
Change $EDITOR env var to the path of your editor so that you can create note,
update note using the editor.

## Others

Shrink DB file

```
nb sql "vacuum;"
```
Use different db file
```
db n -d <dbFile Path>
```

##More
see
```
nb help
```

#Encrypted Database
By default, sqlite database is not encrypted. Although password protected notes are aes256 encrypted, it is nice to have whole database file encrypted.
To do this, once notebox is installed, goto the installation folder and re-build / configure node-sqlite in node_modules folder.

Here is how:
https://github.com/mapbox/node-sqlite3#building-for-sqlcipher
