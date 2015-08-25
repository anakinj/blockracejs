// The Grid component allows an element to be located
//  on a grid of tiles
Crafty.c('Entity', {
    init: function() {
        this.requires('2D, Canvas')
        .attr({
            w: Game.map_grid.tile.width,
            h: Game.map_grid.tile.height,
            z: 2
        })
    },

    // Locate this entity at the given position on the grid
    at: function(x, y) {
        if (x === undefined && y === undefined) {
            return {
                x: this.x / Game.map_grid.tile.width,
                y: this.y / Game.map_grid.tile.height
            }
        } else {
            this.attr({
                x: x * Game.map_grid.tile.width,
                y: y * Game.map_grid.tile.height
            });
            return this;
        }
    }
});

Crafty.c('Surface', {
    init: function() {
        this.requires('Collision, Color, Entity')
        .collision([0, 0], [this.w, 0], [this.w, this.h], [0, this.h])
        .attr({ stickyFactor:1.0, z:1 })
    }
});

Crafty.c('Tarmac', {
    init: function() {
        this.requires('Surface')
        .color('RGB(0, 0, 0)');
    }
});

Crafty.c('Start', {
    init: function() {
        this.requires('Surface')
        .color('RGB(255, 255, 255)');
    }
});

Crafty.c('CheckPoint', {
    init: function() {
        this.requires('Surface')
        .attr({alpha: 0.0})
        .color('RGB(255, 255, 255)');
    }
});

Crafty.c('Grass', {
    init: function() {
        this.requires('Surface')
        .attr({stickyFactor:0.1})
        .color('RGB(0, 255, 0)');
    }
});

Crafty.c('Wall', {
    init: function() {
        this.requires('Surface')
        .color('RGB(100, 25, 25)');
    }
});

Crafty.c('Booster', {
    init: function() {
        this.requires('Surface')
        .attr({ stickyFactor: 2.0, z: 2 })
        .color('RGB(0, 255, 255)');
    }
});

Crafty.c('Car', {
    setKeys: function(keys) {
        this.keys = keys;
        return this;
    },
    handleKeyUpDown: function(key, upDown) {
        switch (key) {
        case this.keys.up:
            this._move.accelerate = upDown;
            break;
        case this.keys.down:
            this._move.reverse = upDown;
            break;
        case this.keys.left:
            this._move.turnLeft = upDown;
            break;
        case this.keys.right:
            this._move.turnRight = upDown;
            break;
        }
    },
    enableDebug: function(x, y){
        if(!this.debug) {
            this.debug = Crafty.e("2D, Canvas, Text").origin('center').attr({w:100,h:20, z:20}).text(function () { return '' });
            this.debug.x = x;
            this.debug.y = y;
        }
      return this;  
    },
    updateDebug: function() {
        if(this.debug) {
            var self = this;
            this.debug.text(function () {
                return 'speed: ' + Math.floor(self._speed.speed) + 
                       ' stickyFactor:' + self._speed.stickyFactor + 
                       ' rotation: ' + Math.floor(self.rotation) + 
                       ' bestTime: '+ self._times.bestTime/1000 +
                       ' currentTime: '+ self.getCurrentTime()/1000 +
                       ' lap:'+ self._times.lap;
            });
        }
    },
    getCurrentTime: function() {
        var now = new Date().getTime();
        if(this._times.startTime) {
            return now - this._times.startTime;
        }
        return null;
    },
    updatePos: function() {
        if (this._speed.speed) {
            var vx = Math.sin(this.rotation * Math.PI / 180) * 0.3,
            vy = Math.cos(this.rotation * Math.PI / 180) * 0.3;
            this.y -= vy * this._speed.speed;
            this.x += vx * this._speed.speed;
        }
    },
    init: function() {
        this.requires('Entity, Keyboard, Collision, Color')
        .attr({
            w: 1 * Game.map_grid.tile.width,
            h: 3 * Game.map_grid.tile.height,
            z: 10,
            rotation: 0.01, 
            _move: {
                turnRight: false,
                turnLeft: false,
                accelerate: false,
                reverse: false,
                turnLeft: false,
                turnRight: false
            },
            _speed: {
                speed: 0,
                topSpeed: 15,
                speedStep: 0.4,
                turnSpeed: 0,
                turnStep: 0.3,
                turnMax: 3,
                stickyFactor:1
            },
            keys: {
                up: Crafty.keys.UP_ARROW,
                down: Crafty.keys.DOWN_ARROW,
                left: Crafty.keys.LEFT_ARROW,
                right: Crafty.keys.RIGHT_ARROW
            },
            _times: {
                lap: 0,
                startTime: null,
                bestTime: null
            }
        })
        .origin('top center')
        .bind('KeyDown', function(e) {
            this.handleKeyUpDown(e.keyCode, true);
        }).bind('KeyUp', function(e) {
            this.handleKeyUpDown(e.keyCode, false);
        }).bind('EnterFrame', function() {
            var topSpeed = this._speed.topSpeed * this._speed.stickyFactor;
            var speedStep = this._speed.speedStep * this._speed.stickyFactor;
            
            if (this._move.accelerate) {
                this._speed.speed += speedStep;
            } else {
                if (this._speed.speed > 0) {
                    this._speed.speed -= this._speed.speedStep * (1+this._speed.stickyFactor);
                    if (this._speed.speed < 0) {
                        this._speed.speed = 0;
                    }
                }
            }
            
            if (this._move.reverse) {
                this._speed.speed -= speedStep * 0.5;
            } else if (this._speed.speed < 0) {
                this._speed.speed += this._speed.speedStep * (1+this._speed.stickyFactor);
                if (this._speed.speed > 0) {
                    this._speed.speed = 0;
                }
            }
            
            if (this._speed.speed > topSpeed) {
                this._speed.speed = topSpeed;
            } else if (this._speed.speed < -(topSpeed * (1 / 3))) {
                this._speed.speed = -(topSpeed * (1 / 3));
            }
            
            if (this._move.turnLeft) {
                if (this._speed.turnSpeed > -this._speed.turnMax) {
                    this._speed.turnSpeed -= this._speed.turnStep;
                }
            }
            else if(this._speed.turnSpeed < 0) {
                this._speed.turnSpeed += this._speed.turnStep*2;
                if(this._speed.turnSpeed > 0) {
                    this._speed.turnSpeed = 0;
                }
            }
            
            if (this._move.turnRight) {
                if (this._speed.turnSpeed < this._speed.turnMax) {
                    this._speed.turnSpeed += this._speed.turnStep;
                }
            }
            else if(this._speed.turnSpeed > 0) {
                this._speed.turnSpeed -= this._speed.turnStep*2;
                if(this._speed.turnSpeed < 0) {
                    this._speed.turnSpeed = 0;
                }
            }
            
            this.rotation += 0.6 * this._speed.turnSpeed;

            this.updatePos();
            this.updateDebug();
        })
        .collision([0, 0], [this.w, 0], [this.w, this.h], [0, this.h])
        .onHit('PlayerCar', function(trgt) {
            for(var i=0;i<trgt.length;i++) {
                    var vx = Math.sin(this.rotation * Math.PI / 180) * 0.3,
                    vy = Math.cos(this.rotation * Math.PI / 180) * 0.3;
                    trgt[i].obj.y -= vy * this._speed.speed;
                    trgt[i].obj.x += vx * this._speed.speed;
            }
            
            if(this._speed.speed) {
                this._speed.speed = -(this._speed.speed*2);
            }
            
            this.updatePos();
        })
        .onHit('Start', 
            function() {
            },
            function() {
                if(this._times.checkPoint !== false) {
                    this._times.checkPoint = false;
                    var now = new Date().getTime();
                    if(this._times.startTime) {
                        var currentTime = now - this._times.startTime;
                        if(!this._times.bestTime || currentTime < this._times.bestTime) {
                            this._times.bestTime = currentTime;
                        }
                    }
                    this._times.startTime = now;
                    this._times.lap++;
                }
            }
        ).onHit('CheckPoint', 
            function() {
            },
            function() {
                this._times.checkPoint = true;
            }
        )
        .onHit('Booster', 
            function() {
                
            },
            function() {
                var oldSpeed = this._speed.topSpeed;
                var self = this;
                this._speed.topSpeed = this._speed.topSpeed*1.5;
                setTimeout(function() {
                    self._speed.topSpeed = oldSpeed;
                }, 2000);
            }
        )
        .onHit('Surface', function(trgt) {
            var min = undefined;
            for(var i=0;i<trgt.length;i++) {
                if(!min || min > trgt[i].obj.stickyFactor) {
                    min = trgt[i].obj.stickyFactor;
                }
            }
            this._speed.stickyFactor = min;
        }).onHit('Wall', function(trgt) {
            if(this._speed.speed) {
                this._speed.speed = -10;
            }
            this.updatePos();
        });
        
    }
});

Crafty.c('PlayerCar', {
    init: function() {
        this.requires('Car')
        .color('rgb(255, 0, 0)');

    }
});
