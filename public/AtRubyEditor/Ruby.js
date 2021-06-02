//ルビ付き（かもしれない）文字
class RubyUnit
{
    constructor(base,ruby = null)
    {
        this.base = base;
        this.ruby = ruby;
    }
    get hasRuby() {return this.ruby != null;}
    get noRuby() {return this.ruby == null;}
}

//ルビを振るための指定文字 RubyUnit(target.substring(offset,offset + length),ruby)
class RubyingWord
{
    constructor( target , ruby , offset = 0 , length = -1 )
    {
        this.target = target;
        this.ruby = ruby;
        this.parent_offset = offset;
        this.parent_length = length >= 0 ? length : target.length - offset;
    }
    
}



//エスケープコードは拾った
(function (w) {
    var reRegExp = /[\\^$.*+?()[\]{}|]/g,
        reHasRegExp = new RegExp(reRegExp.source);

    function escapeRegExp(string) {
        return (string && reHasRegExp.test(string))
            ? string.replace(reRegExp, '\\$&')
            : string;
    }

    w.escapeRegExp = escapeRegExp;
})(window);
    

//ルビ指定（だけじゃないけど）のためのテキスト内の@行処理
class AtTagContainer
{
    constructor(parent = "｜" ,begin = "《" ,end = "》")
    {
        this.ruby_parent = parent;
        this.ruby_begin = begin;
        this.ruby_end = end;

        this.rubying = [];
    }
    LoadAtTag(lyricstext)
    {
        this.lines = [];
        lyricstext.split(/\r\n|\r|\n/).forEach(line => {
            const at = line.match(/^@([^=]+)=(.*)/);
            if (at)
            {
                const name = at[1].toLowerCase(),value = at[2];
                if (name == "ruby_parent")
                {
                    this.ruby_parent = value;
                }
                else if (name == "ruby_begin")
                {
                    this.ruby_begin = value;
                }
                else if (name == "ruby_end")
                {
                    this.ruby_end = value;
                }
                else if (name == "ruby_set")
                {
                    //ルビ指定にタグと紛らわしい[]を使わないとするなら一行で書ける @ruby_set=[｜][《][》]
                    const mat = value.match(/\[([^\[\]]+)\]\[([^\[\]]+)\]\[([^\[\]]+)\]/);
                    if (mat)
                    {
                        this.ruby_parent = mat[1];
                        this.ruby_begin = mat[2];
                        this.ruby_end = mat[3];
                    }
                }
                else if (name == "ruby")
                {
                    const r = value.match(/^\[([^\]]+)\]((\d+),(\d+))?\[([^\]]+)\]$/);
                    if (r)
                    {
                        this.rubying.push(new RubyingWord(r[1],r[5],r[3],r[4]));
                    }
                }
                else
                {//使う予定はないがとりあえず保存だけはしておく
                    this[name] = value;
                }
            }
        });
    }

    AtRubying(text)
    {
        let result = [];
        result.push(new RubyUnit(text));
        this.rubying.forEach(rubying =>
        {
            for (let i = 0;i < result.length;i++)
            {
                if (result[i].hasRuby)
                    continue;

                const target = result[i].base;
                const index = target.indexOf(rubying.target);
                if (index >= 0)
                {
                    const div1 = index + rubying.parent_offset;
                    const div2 = index + rubying.parent_offset + rubying.parent_length;

                    if (div1 > 0 && div2 < target.length)
                    {
                        result.splice(i,1,new RubyUnit(target.substring(0,div1)),
                                           new RubyUnit(target.substring(div1,div2),rubying.ruby),
                                           new RubyUnit(target.substring(div2)));
                        i++;
                    }
                    else if (div1 == 0 && div2 < target.length)
                    {
                        result.splice(i,1,new RubyUnit(target.substring(0,div2),rubying.ruby),
                                           new RubyUnit(target.substring(div2)));

                   }               
                   else if (div1 > 0 && div2 == target.length)
                   {
                        result.splice(i,1,new RubyUnit(target.substring(0,div1)),
                                       new RubyUnit(target.substring(div1),rubying.ruby));
                        i++;
                   }
                   else if (div1 == 0 && div2 == target.length)
                   {
                        result[i].ruby = rubying.ruby;
                   }
                }
            }

        });
        return result;
    }



    Translate(text)
    {
        let result = [];
        let target = text;
        const reg = new RegExp(escapeRegExp(this.ruby_parent) + "(.+?)" + escapeRegExp(this.ruby_begin) + "(.+?)" + escapeRegExp(this.ruby_end));
        do
        {
            const rubyblock = target.match(reg);
            if (rubyblock)
            {
                if (rubyblock.index > 0)
                {
                    result.push(new RubyUnit(target.substring(0,rubyblock.index)));
                }
                result.push(new RubyUnit(rubyblock[1],rubyblock[2]));
                target = target.substring(rubyblock.index + rubyblock[0].length);
            }
            else
            {
                result.push(new RubyUnit(target));
                break;
            }
        } while (target.length > 0);

        for (let i = 0;i < result.length;i++)
        {
            if (result[i].noRuby)
            {
                const arw = this.AtRubying(result[i].base);
                if (arw.length == 1 && arw[0].hasRuby)
                {
                    result[i].ruby = arw[0].ruby;
                }
                else if (arw.length > 1)
                {
                    result.splice(i,1,...arw);
                    i += arw.length - 1;
                }
            }
        }

        return result;
    }    
}

class RubyString
{
    constructor(units)
    {
        this.units = units;
    }
    static Create(text,attag)
    {
        return new RubyString(attag.Translate(text));
    }
}

class RubyText
{
    constructor(text,p = "｜" ,b = "《" ,e = "》")
    {
        this.attag = new AtTagContainer(p,b,e);
        this.attag.LoadAtTag(text);

        this.lines = [];
        text.split(/\r\n|\r|\n/).forEach(line => {
            if (line.indexOf("@") != 0)
                this.lines.push(RubyString.Create(line,this.attag));
        });
    }
}

