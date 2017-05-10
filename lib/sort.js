var Transform = require('stream').Transform

var inherits = require('inherits')

var common = require('./common');

var InspectStream   = common.InspectStream
var decodeArguments = common.decodeArguments;
var filesStream     = common.filesStream;


function Sort(args)
{
  if(!(this instanceof Sort)) return new Sort(args);

  Sort.super_.call(this, {objectMode: true});


  function result_sort(a, b)
  {
    a = a.inspect ? a.inspect() : a.data;
    b = b.inspect ? b.inspect() : b.data;

    if(args['ignore-leading-blanks'])
    {
      a = a.trim();
      b = b.trim();
    }

    switch(args['sort'])
    {
      case 'general-numeric': return parseFloat(a) - parseFloat(b)
      case 'random':          return Math.floor(Math.random() * 3 - 1);
    }

    var options =
    {
      sensitivity: args['ignore-case'] ? 'accent' : 'variant',
      ignorePunctuation: args['dictionary-order'],
      numeric: (args['sort'] == 'numeric')
    }
    return a.localeCompare(b, 'en', options);
  }


  var result = []


  this._transform = function(chunk, encoding, done)
  {
    result.push(chunk);
    done()
  }

  this._flush = function(done)
  {
    result.sort(result_sort)

    if(args.reverse) result.reverse()

    result.forEach(this.push.bind(this), this)
    done()
  }
}
inherits(Sort, Transform)

Object.defineProperty(Sort.prototype, 'type', {value: 'scheme=coreutils.sort'});


function sort()
{
  var args = decodeArguments(arguments)

  var files = args._

  // Ordering options

  if(args.b) args['ignore-leading-blanks'] = true;
  if(args.d) args['dictionary-order']      = true;
  if(args.f) args['ignore-case']           = true;
//  if(args.i) args['ignore-nonprinting']    = true;
  if(args.r) args['reverse']               = true;

  if(args.g || args['general-numeric-sort']) args['sort'] = 'general-numeric';
//  if(args.h || args['human-numeric-sort'])   args['sort'] = 'human-numeric';
//  if(args.M || args['month-sort'])           args['sort'] = 'month';
  if(args.n || args['numeric-sort'])         args['sort'] = 'numeric';
  if(args.R || args['random-sort'])          args['sort'] = 'random';
//  if(args.V || args['version-sort'])         args['sort'] = 'version';

//  args['random-source']

  // Other options

//  args['batch-size']
//  args['check']
//  args['compress-program']
//  args['debug']
//  args['files0-from']
//  args['key']
//  args['merge']
//  args['output']
//  args['stable']
//  args['buffer-size']
//  args['field-separator']
//  args['temporary-directory']
//  args['parallel']
//  args['unique']
//  args['zero-terminated']

  return filesStream(files).pipe(Sort(args))
}

sort.Sort = Sort;


module.exports = sort;
