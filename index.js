'use strict';

var Promise = require('native-or-bluebird');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var os = require('os');
var fs = require('fs');
var cluster = require('cluster');

function clean(obj) {
  if(obj === null || typeof obj !== 'object') {
    return obj;
  }

  if(obj instanceof Array) {
    return obj.filter(function(item) {
      return !!clean(item);
    });
  }

  if(obj instanceof Date) {
    return obj;
  }

  var r = {};

  Object.keys(obj).forEach(function(key) {
    var item = clean(obj[key]);
    if(!!item) {
      r[key] = item;
    }
  });

  return r;
}

function clone(obj) {
  var copy;

  if(obj === null || typeof obj !== 'object') {
    copy = obj;
  } else if(obj instanceof Array) {
    copy = [];
    obj.forEach(function(element, index) {
      copy[index] = clone(element);
    });
  } else if(obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
  } else {
    copy = {};
    Object.keys(obj).forEach(function(key) {
      copy[key] = clone(obj[key]);
    });
  }

  return copy;
}

function merge(a, b) {
  a = clone(a);

  var isArray = Array.isArray(b);
  var out = isArray ? [] : {};

  if(isArray) {
    out = out.concat(a);
    b.forEach(function(value) {
      out.push(clone(value));
    });
  } else {
    out = a;
    Object.keys(b).forEach(function(key) {
      out[key] = clone(b[key]);
    });
  }

  return out;
}

function setupCluster(config, done) {
  var defaults = {
    enable: true,
    instances: os.cpus().length - 1 || 1
  };

  if(arguments.length) {
    if(typeof config === 'function') {
      done = config;
      config = defaults;
    }
  } else {
    config = defaults;
  }

  function fork() {
    var worker = cluster.fork();

    return worker;
  }

  var instances = config.instances ? config.instances : 1;

  if(config.enable && cluster.isMaster) {
    for(var i = 0; i < instances; i++) {
      fork();
    }

    cluster.on('exit', function(worker) {
      if(!worker.suicide) {
        fork();
      }
    });
  } else {
    process.nextTick(done);
  }
}

function unique(prefix) {
  return new Promise(function(resolve, reject) {
    return crypto.randomBytes(16, function(err, token) {
      if(err) {
        return reject(err);
      }

      token = prefix ? prefix + ':' + token.toString('hex') : token.toString('hex');
      return resolve(token);
    });
  });
}

function hash(value, salt) {
  salt = salt || 10;

  return new Promise(function(resolve, reject) {
    return bcrypt.hash(value, salt, function(err, hashed) {
      if(err) {
        return reject(err);
      }

      return resolve(hashed);
    });
  });
}

function compareHash(raw, hash) {
  return new Promise(function(resolve, reject) {
    return bcrypt.compare(raw, hash, function(err, result) {
      if(err) {
        return reject(err);
      }

      return resolve(result);
    });
  });
}

function defer(time) {
  time = time || 0;

  return new Promise(function(resolve) {
    return setTimeout(resolve, time);
  });
}

function safeParse(json) {
  var p = null;
  try {
    p = JSON.parse(json);
  } catch(e) {
    return Promise.reject(e);
  }

  return Promise.resolve(p);
}

function readFile(path) {
  return new Promise(function(resolve, reject) {
    return fs.readFile(path, 'utf8', function(err, data) {
      if(err) {
        return reject(err);
      }

      return resolve(data);
    });
  });
}

function writeFile(path, data) {
  return new Promise(function(resolve, reject) {
    return fs.writeFile(path, data, function(err) {
      if(err) {
        return reject(err);
      }

      return resolve();
    });
  });
}

function padder(value, opts) {
  opts = opts || {};

  var num = opts.length || value.length + 1;
  var prefix = opts.prefix || '0';

  value = String(value);

  do {
    value = prefix + value;
  } while(value.length < num)

  return value;
}

module.exports = {
  clone: clone,
  clean: clean,
  merge: merge,
  cluster: setupCluster,
  unique: unique,
  hash: hash,
  compareHash: compareHash,
  defer: defer,
  parse: safeParse,
  read: readFile,
  write: writeFile,
  padder: padder
};
