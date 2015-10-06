var d3ppm = {};


d3ppm.dataManager = function module() {
    var exports = {},
        dispatch = d3.dispatch('dataReady', 'dataLoading'), 
        data;
        
    data = [];   
                 
    var xmlhttp = Xhr();
    exports.dataToJSON = function() {
        return data;
    };
    
    exports.getClarityData = function(_queryCode, _filters, _projection) {
        dispatch.dataLoading();
        currentUrl = window.location.toString();
        clarityUrl = currentUrl.substr(0, currentUrl.indexOf("/niku") + 5);
        data.length = 0;
		endpoint = clarityUrl + "/xog";
		sessionCookie = getCookie('sessionId');
         
        try {
            callXOGAPI(_queryCode, _filters);
		} catch(err) {
            var error = err.message;
		}
        
         
        function OnXmlhttpReadyState() {
            if (xmlhttp.readyState == 4 && (xmlhttp.status == 200 || xmlhttp.status === 0)) {
                var xmlData = xmlhttp.responseXML;
                var rows = xmlData.getElementsByTagName("Record");
                for (var i = 0; i < rows.length; i++) {
                    var record = {};
                    var fields = rows[i].getElementsByTagName("*");
                    for (var j = 0; j < fields.length; j++)  {
                        record[camelCase(fields[j].nodeName)] = fields[j].innerHTML.replace('&amp;', '&') ;
                    }
                    data.push(record); 
                }
                dispatch.dataReady(data);
            }
        }       
        
        function callXOGAPI(queryCode, filters) {
            var filter = '';
            
            if (filters) {
            
                filter = '<quer:Filter>'
                for (var propName in filters) {
                    if(typeof(filters[propName] != "undefined"))  {
                        filter = filter+'<'+propName+'>'+filters[propName]+'</'+propName+'>'
                     }   
                 }    
                filter = filter+'</quer:Filter>'
            } else { 
            
            }     

            if (xmlhttp === null) return null;

            var xml = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:quer="http://www.niku.com/xog/Query">' +
            '<soapenv:Header>' +
            '<quer:Auth>' +
            '<quer:SessionID>' + sessionCookie + '</quer:SessionID>' +  
            '</quer:Auth>' +
            '</soapenv:Header>' +
            '<soapenv:Body>' +
            '<quer:Query>' +
            '<quer:Code>' + queryCode + '</quer:Code>' +
            filter +
            '</quer:Query>' +
            '</soapenv:Body>' +
            '</soapenv:Envelope>';
           xmlhttp.open("POST", endpoint, true);
           xmlhttp.onreadystatechange = OnXmlhttpReadyState;
           xmlhttp.send(xml);
        }
    
    };
        
    d3.rebind(exports, dispatch, 'on');
    
    return exports;   

}

function Xhr() { /* returns cross-browser XMLHttpRequest, or null if unable */
    return window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Msxml2.XMLHTTP');
}

function getCookie(cName) {
    var i, cookieName, cookieValue, thisCookie, allCookies = document.cookie.split(";");
    for (i = 0; i < allCookies.length; i++) {
        thisCookie = allCookies[i].split("=");
        cookieName = thisCookie[0].replace(/^\s+|\s+$/g, "");
        cookieValue = thisCookie[1];
        if (cookieName == cName) return unescape(cookieValue);
    }
    return "";
}

function camelCase(fieldName)  {
	return fieldName[0].toLowerCase() + fieldName.replace(/_([a-z])/g, function(match, group1) {
        return group1.toUpperCase();
    }).slice(1);
}    
 
  
 


 
