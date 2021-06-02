
(function Mode_Text(){

const textarea = document.getElementById("TextArea");
function Initialize(text)
{
    textarea.value = text;
}

function Terminalize()
{
    return textarea.value;
}


ModeTextInitializer = {Initialize:Initialize,Terminalize:Terminalize};

}());