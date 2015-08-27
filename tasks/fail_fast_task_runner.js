/*
 * grunt-fail-fast-task-runner
 *
 *
 * Copyright (c) 2015 Greg Alexander
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  // Node Modules
  var path = require('path'),
    util = require('util'),
    // 3rd party modules
    _ = require('lodash'),
    async = require('async'),
    chalk = require('chalk');

  grunt.registerMultiTask('fail_fast_task_runner', 'A Grunt task to run tasks on multiple Grunt projects that will fail fast', function () {

    var options = this.options({
        concurrency: 1,
        includeSelf: false
      }),
      args = this.args.length < 1 ? false : this.args,
      errors = 0,
      // We get this from grunt. Let async process know its done
      done = this.async(),
      // Get process.argv options without grunt.cli.tasks to pass to child processes
      cliArgs = _.without.apply(null, [[].slice.call(process.argv, 2)].concat(grunt.cli.tasks)),
      ownGruntFile = grunt.option('gruntfile') || grunt.file.expand({filter: 'isFile'}, '{G,g}runtfile.{js,coffee}')[0],
      lastFileWritten;

    var writeToLog = function(isError, buf, gruntfile, dir) {
      if (gruntfile !== lastFileWritten) {
        grunt.log.writeln('');
        grunt.log.writeln('');
        grunt.log.writeln(chalk.bold.cyan(util.format('Running gruntfile in /%s:', dir)));
      }
      grunt.log[(isError) ? 'error' : 'write'](buf);
      lastFileWritten = gruntfile;
    };

    ownGruntFile = path.resolve(process.cwd(), ownGruntFile || '');

    // queue for concurrently ran tasks
    var queue = async.queue(function(taskToRun, next) {
      var skipNext = false;

      grunt.log.ok(chalk.bold.magenta(util.format('Running grunt task [%s] on %s', taskToRun.tasks, taskToRun.gruntfile)));

      if (cliArgs) {
        // Create new cliArgs array matching criteria
        cliArgs = cliArgs.filter(function(currentValue) {
          if (skipNext) {
            return (skipNext = false);
          }

          var out = /^--gruntfile(=?)/.exec(currentValue);

          if (out) {
            if (out[1] !== '=') {
              skipNext = true;
            }
            return false;
          }

          return true;
        });
      }

      var child = grunt.util.spawn({
        // Use grunt to run the tasks
        grunt: true,
        // Run from dirname of gruntfile
        opts: {cwd: path.dirname(taskToRun.gruntfile)},
        // Run task to be run and any cli options
        args: taskToRun.tasks.concat(cliArgs || [], '--gruntfile=' + taskToRun.gruntfile)
      }, function(err) {
        if (err) {
          errors++;
        }
        next(err);
      });

      child.stdout.on('data', function(buf) {
        writeToLog(false, buf, taskToRun.gruntfile, taskToRun.dir);
      });

      child.stderr.on('data', function(buf) {
        writeToLog(true, buf, taskToRun.gruntfile, taskToRun.dir);
      });

    }, options.concurrency);

    // When the queue is all done
    queue.drain = function() {
      done((errors === 0));
    };

    // All files specified using any Grunt-supported file formats and options, globbing patterns or dynamic mappings
    this.files.forEach(function(files) {
      // Return a unique array of all file or directory paths that match the given globbing pattern(s)
      var gruntfiles = grunt.file.expand({filter: 'isFile'}, files.src),
        splitPath;

      if (gruntfiles.length === 0) {
        grunt.log.warn(chalk.bold.red(util.format('No Gruntfiles matched the file patterns: %s"', files.orig.src.join(', '))));
      }

      gruntfiles.forEach(function(gruntfile) {
        gruntfile = path.resolve(process.cwd(), gruntfile);
        splitPath = gruntfile.split('/');

        // Skip it's own gruntfile. Prevents infinite loops.
        if (!options.includeSelf && gruntfile === ownGruntFile) {
          return;
        }

        queue.push({
          gruntfile: gruntfile,
          tasks: args || files.tasks || ['default'],
          dir: splitPath.length > 1 ? splitPath[splitPath.length - 2] : process.cwd()
        }, function(err) {
          if (err) {
            queue.kill();
            done((errors === 0));
          }
        });
      });

    });

    // Make sure that at least one file is queued
    if (queue.idle()) {
      // If the queue is idle, assume nothing was queued and call done() immediately after sending warning
      grunt.warn(chalk.bold.red('No Gruntfiles matched any of the provided file patterns'));
      done();
    }
  });
};
