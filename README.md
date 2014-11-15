Raven
=====

> "Why is a raven like a writing desk?"
> Like Poe, you might write on both.

Raven is a minimal, distraction-free text editor with good typography.

![Raven screenshot](https://raw.githubusercontent.com/robotlolita/raven/master/screenshot.png)

> **NOTE**
>
> This project is still in REALLY EARLY STAGES of development. While it's
> usable, most of the features are not implemented, and it might just break and
> eat all your novel DON'T YA DARE TRUST IT YA HEAR.


## Getting Started

 1. Download the right distribution for your platform:

     *  __Linux__: [32 bit][linux-32] / [64 bit][linux-64]
     *  [__Windows__][win]
     *  [__Mac OS X__][mac]

 2. Unzip it wherever you want the application to be;
 3. Double click the `Raven` / `Raven.exe` / `Raven.app` file;
 4. Select the folder where you want to store your novels;
 5. Create a new novel, and start writing.

[linux-32]: https://github.com/robotlolita/raven/releases/download/v0.1.0-alpha3/Raven-linux32.tar.gz
[linux-64]: https://github.com/robotlolita/raven/releases/download/v0.1.0-alpha3/Raven-linux64.tar.gz
[mac]: https://github.com/robotlolita/raven/releases/download/v0.1.0-alpha3/Raven-osx.zip
[win]: https://github.com/robotlolita/raven/releases/download/v0.1.0-alpha3/Raven-win.zip

## Building

You'll need [Node Webkit][], [Node][], `Make` and other *NIX tools (like `cat`)
installed. Once you do, just run the following commands:

```shell
$ git clone git://github.com/robotlolita/raven
$ cd raven
$ npm install
$ make run                      # This assumes `nw` is in your PATH
```

[Node Webkit]: https://github.com/rogerwang/node-webkit
[Node]: http://nodejs.org/



- - -
Raven is MIT licensed

