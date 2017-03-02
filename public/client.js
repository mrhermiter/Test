/**
 * Created by dmk on 28.02.17.
 */
$(function () {

    const chat = io.connect("http://localhost:3000/chat");
    const screen=io.connect("http://localhost:3000/screen");
    $("#userNameForm").submit((e) => {

        e.preventDefault();
        if ($("#userName").val() != "")
            chat.emit("setUserName", $("#userName").val(), (data) => {

                if (data) {

                    $("#userNameForm").hide();
                    $("#chatPanel").show();
                    $("#message").val("").focus();
                    $("#userName").val("");
                }
                else {

                    alert("Please, try again!");
                }
            });
        else
            alert("Please, enter your name.");
    });

    chat.on("updateUsers", (data) => {

        updateChatUsers(data);
    });
    $("#message").keydown((e) => {

        if (e.ctrlKey && e.keyCode == 13) {

            $("#sendMessageForm").submit();
            return false;
        }
    });
    $("#sendMessageForm").submit((e) => {

        e.preventDefault();
        let message = nl2br($("#message").val());
        if (message === "")
            return false;
        chat.emit("sendMessage", message);
        $("#message").val("").focus();
    });

    chat.on("newMessage", (data) => {

        showNewMessage(data);
    });


    $("#btnTest").click((e)=>{

        e.preventDefault();
        screen.emit("getSreen","");
        return false;
    });
    var view=[];
    screen.on("newScreen",(data)=>{

        view.push(new Uint8Array(data));
        console.log(view);
    });




    screen.on("endNewScreen",(data)=>{

        var blob = new Blob(view, {type: "image/png"});
        var a=URL.createObjectURL(blob);

        $("#image").attr("src",a);
        view=[];
    });
});


function updateChatUsers(data) {

    var listUsers = "";
    for (let i = 0; i < data.length; i++) {

        listUsers += '<li class="list-group-item">' + data[i] + '</li>';
    }
    $("#chatUsers").html(listUsers);
}

function showNewMessage(data) {

    $("#chatArea").append('<div class="well"><strong>' + data.usr + '</strong>: ' + data.msg + '</div>');
    document.getElementById("chatArea").scrollTop = document.getElementById("chatArea").scrollHeight;
}

function nl2br(s) {
    s = s.split("\u000A").join("<br />\u000A");
    return s;
}
