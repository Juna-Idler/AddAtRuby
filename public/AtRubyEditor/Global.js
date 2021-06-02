

var ModeTextInitializer;
var ModeRubyInitializer;

(function ModeShifter(){

const tab_text = document.getElementById("TabText");
const tab_ruby = document.getElementById("TabRuby");

var LastMode = "text";

function TabChange(e)
{
    let text_data = "";
    switch (LastMode)
    {
        case "text":
            if (tab_text.checked) return;
            text_data = ModeTextInitializer.Terminalize();
        break;
        case "ruby":
            if (tab_ruby.checked) return;
            text_data = ModeRubyInitializer.Terminalize();
        break;
    }


    if (tab_text.checked)
    {
        ModeTextInitializer.Initialize(text_data);
        LastMode = "text";
    }
    else if (tab_ruby.checked)
    {
        ModeRubyInitializer.Initialize(text_data);
        LastMode = "ruby";
    }
}


tab_text.addEventListener("change",TabChange);
tab_ruby.addEventListener("change",TabChange);

}());

(function Download(){
    document.getElementById('download').addEventListener('click', (e)=>{
        e.preventDefault();
        const text = document.getElementById("TextArea").value;
        if (text === "")
            return;
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]),text], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);

        const now = new Date();
        const y = now.getFullYear();
        const m = ('00' + (now.getMonth()+1)).slice(-2);
        const d = ('00' + now.getDate()).slice(-2);
        const h = ('00' + now.getHours()).slice(-2);
        const mi = ('00' + (now.getMinutes()+1)).slice(-2);

        a.download = "are" + y + "-" + m + d + "-" + h + mi + '.txt';
        a.href = url;

        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    });
}());
