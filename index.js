/**
 * Created by phoenix on 16/04/15.
 */
'use strict';

var Rastrear = function(ref) {
  var estafeta = ref;
  return {
    exec : function(params) {
      estafeta.rastrear(params);
    }
  }
}

var Cotizar = function(ref) {
  var estafeta = ref;
  return {
    exec : function(params) {
      estafeta.cotizar(params);
    }
  }
}

var Firma = function(ref) {
  var estafeta = ref;
  return {
    exec : function(params) {
      estafeta.firma(params);
    }
  }
}

var Comprobante = function(ref) {
  var estafeta = ref;
  return {
    exec : function(params) {
      estafeta.comprobante(params);
    }
  }
}

var NodEstafeta = function() {
  this.Rastrear = new Rastrear(this);
  this.Cotizar = new Cotizar(this);
  this.Firma = new Firma(this);
  this.Comprobante = new Comprobante(this);
};

NodEstafeta.prototype.rastrear = function(data) {
    var request = require('request');
    
    request.post ("http://rastreo3.estafeta.com/RastreoWebInternet/consultaEnvio.do",{
      form:data},function(err,res){
               if(err) {
                // data.error(err);
                data.result(err);
                return;
               }


               var html = res.body;
              
                var cheerio = require('cheerio'),
                $ = cheerio.load(html),
                estafetaResult = {};

                $('div table').each(function(i, table){
                  var tableChild = $(this);
                  var $$ = cheerio.load(tableChild.html());
                  var dataRequest = [];
                  $$('tr').each(function(j, tr){
                           var trChild = $$(this).children();;
                           if(j== 1){
                              console.log('****'+trChild.eq(1).children().text());
                              var  row =  {informacionEnvio:trChild.eq(1).children().text()};
                              dataRequest.push(row); 
                              
                           }
                           
                    }); 
                  estafetaResult['encabezado'] = dataRequest;
                });


                     



          return data.result (null,estafetaResult)

      } );

};

NodEstafeta.prototype.cotizar = function(data) {

  var request = require('request');
// var env = require('jsdom').env;

  request.post('http://herramientascs.estafeta.com/Cotizador/Cotizar', {
    /*
    form: {
      Alto: 10,
      Ancho: 10,
      CPDestino: 15000,
      CPOrigen: 72540,
      Largo: 10,
      Peso: 5,
      Tipo: 'paquete',
      cTipoEnvio: 'paquete'
    }
     */
    form: data
  }, function(err, res) {
    // console.log(err, res);

    if(err) {
      // data.error(err);
      data.result(err);
      return;
    }

    // console.log('*********************************************');
    var html = res.body;
    // console.log(res.body);

    /*
     // first argument can be html string, filename, or url
     env(html, function (errors, window) {
     console.log(errors);

     var $ = require('jquery')(window);

     // console.log($('div table')[$('div table').length - 1].children[$('div table')[$('div table').length - 1].children.length-1]);

     console.log($('div table')[$('div table').length - 1].innerHTML);
     });
     */


    var cheerio = require('cheerio'),
      $ = cheerio.load(html),
      estafetaResult = {};


    $('div table').each(function(i, table){
      var tableChild = $(this);
      // console.log('****************************** ' + i + ' ******************************');
      // console.log(tableChild.html());
      var $$ = cheerio.load(tableChild.html());

      if(i == 0) {
        // console.log('****************************** ENTRO IF ******************************');
        // console.log($$);

        var data = [];
        $$('tr').each(function(j, tr){
          var children = $$(this).children();
          // console.log('****************************** ' + j + ' ******************************');

          var llave = children.eq(0).children().eq(0).children().eq(0);
          var valorTxt = children.eq(1).children().eq(0);
          var valorVal = valorTxt.children().eq(0);
          var descripcionTxt = children.eq(2).children().eq(0);

          var descripcionVal;
          if(j < 2) {
            descripcionVal = descripcionTxt.children() ? descripcionTxt.children().eq(0) : null
          } else {
            descripcionVal = descripcionTxt.children() ? descripcionTxt.children().eq(0).children().eq(0) : null
          }

          var row = {
            llave: llave.text().trim(),
            valor: valorTxt.text().trim() + ' ' + (valorVal ? valorVal.val().trim() : ''),
            descripcion: descripcionTxt.text().trim() + (descripcionVal && descripcionVal.val() !== undefined ? descripcionVal.val().trim() : '')
          };

          data.push(row);
          //console.log(row);

        });
        estafetaResult['encabezado'] = data;
      } else if(i == 1) {
        // console.log($('div table')[$('div table').length - 1]);
        // console.log('****************************** ENTRO ELSEIF ******************************');
        // console.log($$);

        var data = [];
        $$('tr').each(function(j, tr){
          var children = $$(this).children();
          // console.log('****************************** ' + j + ' ******************************');
          if(j >= 2) {

            var descProducto = children.eq(0).children().eq(0).children().eq(0);
            var pesoKg = children.eq(1);
            var tarifaGuia = children.eq(2);
            var tarifaCc = children.eq(3);
            var cargosExtras = children.eq(4);
            var sobrepesoCosto = children.eq(5);
            var sobrepesoCc = children.eq(6);
            var costoTotal = children.eq(7);

            var row = {
              descProducto: descProducto.text().trim(),
              pesoKg: pesoKg.text().trim(),
              tarifaGuia: tarifaGuia.text().trim(),
              tarifaCc: tarifaCc.text().trim(),
              cargosExtras: cargosExtras.text().trim(),
              sobrepesoCosto: sobrepesoCosto.text().trim(),
              sobrepesoCc: sobrepesoCc.text().trim(),
              costoTotal: costoTotal.text().trim()
            };

            data.push(row);
            //console.log(row);

          }
        });
        estafetaResult['detalle'] = data;
      }

    });

    //console.log(estafetaResult);
    // return data.success(estafetaResult);
    return data.result(null, estafetaResult);

  });

};

NodEstafeta.prototype.firma = function(data) {

};

NodEstafeta.prototype.comprobante = function(data) {

};

if(typeof module !== 'undefined' && module.exports) {
  module.exports = new NodEstafeta();
} else {
  root.nodEstafeta = new NodEstafeta();
}
