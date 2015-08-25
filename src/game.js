Game = {
    map_grid: {
        width:  128,
        height: 128,
        tile: {
            width:  8,
            height: 8
        }
    },
    
    width: function() {
      return this.map_grid.width * this.map_grid.tile.width;
    },
    
    height: function() {
      return this.map_grid.height * this.map_grid.tile.height;
    },
    start: function() {
        Crafty.init();
        Crafty.canvas.init();
        Crafty.scene('loading', function() {
            Crafty.e("2D, Canvas, Text").origin('center').attr({x:100, y:100, w:100,h:20, z:20}).text(function () { return 'Loading...' });
            Crafty.scene('main');
        });
        
        Crafty.scene('main', function() {
            Game.loadCircuit('circuits/test1.cir', function(data) {
                Game.populateCircuit(data);
                var player1 = Crafty.e('PlayerCar').at(17, 43).enableDebug(10, 0);
                var player2 = Crafty.e('PlayerCar').at(20, 43).color('RGB(0, 0, 200)').setKeys({
                    up: Crafty.keys.W,
                    down: Crafty.keys.S,
                    left: Crafty.keys.A,
                    right: Crafty.keys.D
                }).enableDebug(10, 8);
            });
        });
        
        Crafty.scene('loading');
    },
    loadCircuit: function (file, callback) {
      $.get(file, function(data) {
          var circuitData = [];
        $.each(data.split(/\r\n|\r|\n/g), function(y, row) {
            var rowData = [];
            for(var x=0;x<row.length;x++) {
                rowData.push(row[x]);
            }
            circuitData.push(rowData);
        });
        if(callback) {
            callback(circuitData);
        }
      });
    },
    populateCircuit: function(data) {
        $.each(data, function(y, row) {
            $.each(row, function(x, tile) {
                if(tile === 't') {
                    Crafty.e('Tarmac').at(x,y);        
                } else if(tile === 'g') {
                    Crafty.e('Grass').at(x,y);            
                } else if(tile === 'w') {
                    Crafty.e('Wall').at(x,y);            
                } else if(tile === 's') {
                    Crafty.e('Tarmac').at(x,y); 
                    Crafty.e('Start').at(x,y);    
                }
                else if(tile === 'b') {
                    Crafty.e('Tarmac').at(x,y); 
                    Crafty.e('Booster').at(x,y);    
                }
                else if(tile === 'c') {
                    Crafty.e('Tarmac').at(x,y); 
                    Crafty.e('CheckPoint').at(x,y);    
                }
            });
        });
        
    }
};
      