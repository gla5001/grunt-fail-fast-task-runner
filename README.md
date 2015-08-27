# grunt-fail-fast-task-runner

> A Grunt task to run tasks on multiple Grunt projects that will exit immediately on failure (fail fast)

## Getting Started
This plugin requires Grunt.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-fail-fast-task-runner --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-fail-fast-task-runner');
```

## The "fail_fast_task_runner" task

### Overview
The `fail_fast_task_runner` task is for running tasks on multiple projects. It would like to know which Gruntfiles to use and which tasks to run on each Grunt project. For example if you would like to lint and test on every Grunt project one folder up

```js
grunt.initConfig({
  fail_fast_task_runner: {
    all: {
      src: ['../*/Gruntfile.js'],
      tasks: ['jshint', 'nodeunit'],
    }
  },
});
```

### Options

#### options.concurrency
Type: `Number`
Default value: `1`

An integer for determining how many worker functions should be run in parallel.

### Usage Examples

#### Default Options
In this example, the default options are used to run tasks on multiple projects. So running `fail_fast_task_runner:build` will run the `buildtask` over all Gruntfiles, and running `fail_fast_task_runner:all` will run the tasks `dev` and `tasks`.
If no tasks are defined, it will default to the default task.

```js
grunt.initConfig({
  fail_fast_task_runner: {
    options: {},
    build: {
      src: ['*/Gruntfile.js'],
      tasks: ['buildtask']
    },
    all: {
      src: ['*/Gruntfile.js'],
      tasks: ['dev', 'tasks']
    }
  },
})
```

#### Custom Options
In this example, custom options are used to run with a concurrency of 5.

```js
grunt.initConfig({
  fail_fast_task_runner: {
    options: {
      concurrency: 5
    },
    build: {
      src: ['*/Gruntfile.js'],
      tasks: ['buildtask']
    },
    all: {
      src: ['*/Gruntfile.js'],
      tasks: ['dev', 'tasks']
    }
  },
})
```

## Contributing
Open issue or pull request

## Release History
- 0.1.0 initial release

## License
Copyright (c) 2015 Greg Alexander. Licensed under the MIT license.
