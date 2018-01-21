// ref: https://pegjs.org/online
/* sample data
----------------------------------------
log 2018-01-07

* hoge

02:02 い
1 あ

ignore
----------------------------------------
*/

module.exports = `
Term
  = head:Header tail:(_ Line)* {
  return tail.reduce(function(s, v) {
    if (v) {
      s.push(v[1]);
    }
    return s;
  }, [head])
}
  
Line
  = Record / Daily / Ignore / LineSeparator {
}

Record
  = time:TimeFormat Space chars:Char _ {
  return {type: 'record', time, chars}
}

Header
  = HeaderKeyword Space date:DateFormat _ {
  return {type: 'header', date}
} / date:DateFormat _ {
  return {type: 'header', date}
}

HeaderKeyword = "log"

Daily
  = DailyKeyword Space chars:Char _ {
  return {type: 'daily', chars}
}

DailyKeyword = "*"

TimeFormat
  = hour:Integer TimeSeparator minute:Integer {
  return {hour, minute}
} / hour:Integer {
return {hour}
}

DateFormat
  = year:Integer DateSeparator month:Integer DateSeparator day:Integer {
  return {year, month, day}
}

Ignore
  = chars:Char _ {
  return {type: "ignore", chars}
}

Integer
  = [0-9]+ { return text() }

Char
  = [^\\n\\r]+ {return text() }

Space
  = [ 　]+

DateSeparator
  = "-"

TimeSeparator
  = ":"

_ "line separator"
  = LineSeparator*

LineSeparator
  = [\\n\\r]
`;
