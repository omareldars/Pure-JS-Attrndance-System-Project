
const fetch_options = {
    headers: {
        'Content-Type': 'application/json'
    },
}

user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
new_user = null

window.addEventListener('load', function () {

    const reg_form = document.getElementById('register')
    const login_form = document.getElementById('login')



    if (reg_form) {

        $('#register').on('submit', function (event) {

            event.preventDefault();
            event.stopPropagation();

            let new_user = {
                id: Math.floor(Math.random() * 100000),
                // username: new Date().getTime(),
                username: document.querySelector('#register #firstname').value + Math.floor(Math.random() * 100000),
                password: 'new@pass' + Math.floor(Math.random() * 100000),
                firstname: document.querySelector('#register #firstname').value,
                lastname: document.querySelector('#register #lastname').value,
                address: document.querySelector('#register #address').value,
                email: document.querySelector('#register #email').value,
                age: document.querySelector('#register #age').value,
                role: 'employee',
                late: [],
                attend: [],
                absent: []
            }


            Email.send({
                Host: "smtp.elasticemail.com",
                port: 2525,
                Username: 'omar.a.eldars@gmail.com',
                Password: '9F20643FB271D01082514CF2F03485C3FB88',
                To: new_user.email,
                From: "omar.a.eldars@gmail.com",
                Subject: `register confirmation email`,
                Body: `Hello ${new_user.firstname}, <br/> Your username is:  ${new_user.username} <br/> And Your Password: ${new_user.password}`
            }).then(resp => {
                fetch('http://localhost:3000/users', {
                    ...fetch_options,
                    method: 'POST',
                    body: JSON.stringify(new_user)
                })
                    .then(response => {
                        alert('success registration, you will get a confirmation email soon')
                    })
                    .catch(error => alert(error))
            })


        })
    }

    if (login_form) {
        login_form.addEventListener('submit', function (e) {
            e.preventDefault()
            e.stopPropagation()

            let username = document.querySelector('#login #username').value,
                password = document.querySelector('#login #password').value

            fetch(`http://localhost:3000/users?username=${username}&password=${password}`)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                })
                .then(jsonResponse => {
                    if (jsonResponse.length === 0) {
                        alert('this user doent exist')
                    } else {
                        alert('success login ...')
                        localStorage.setItem('user', JSON.stringify(jsonResponse[0]))

                        if (jsonResponse[0].role == 'admin') {
                            location.replace('./homeadmin.html')
                        } else {
                            location.replace('./profile.html')


                        }
                    }
                })

        })
    }



    fetch(`http://localhost:3000/users`)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
        })
        .then(jsonResponse => {

            jsonResponse.forEach(user => {
                $('select#confirm-attendance').append(new Option(`${user.firstname} ${user.lastname}`, user.id));
            })
        })

    $('#close_butt').click(function (event) {
        event.preventDefault();
        event.stopPropagation();
        document.getElementById('up').style.display = 'block';
        document.getElementById('down').style.display = 'none';
    })
    $('#attend_butt').click(function (event) {

        event.preventDefault();
        event.stopPropagation();
        document.getElementById('up').style.display = 'none';
        document.getElementById('down').style.display = 'block';

        let tempUser = null
        let id = $('#confirm-attendance').val();

        fetch(`http://localhost:3000/users?id=${id}`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
            })
            .then(jsonResponse => {
                let now = new Date()
                tempUser = jsonResponse[0]
                document.getElementById("employee_name").innerHTML += tempUser.firstname;
                document.getElementById("employee_attend_time").innerHTML += now.toLocaleTimeString();

                if (now.getHours() == 9 && now.getMinutes() < 20) {
                    tempUser.attend.push(new Date().toLocaleDateString())

                }
                else if ((now.getHours() == 9 && now.getMinutes() >= 20) || ((now.getHours() > 9) && now.getHours() < 12)) {
                    var r = confirm("Do you have excuse?");
                    if (r == true) {
                        tempUser.late.push(new Date().toLocaleDateString() + '- with excuse');
                    } else {
                        tempUser.late.push(new Date().toLocaleDateString());
                    }

                }
                else {
                    tempUser.absent.push(new Date().toLocaleDateString());

                }
                if (now.toLocaleDateString() in tempUser.absent) {
                }
            })


    })

    fetch(`http://localhost:3000/users?`)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
        })
        .then(jsonResponse => {
            if (jsonResponse) {
                jsonResponse.forEach(val => {
                    let excuseCount = 0;
                    let lateCount = 0;
                    val.late.forEach(val => {
                        if (!val.includes('with excuse')) {
                            lateCount++
                        } else {
                            excuseCount++
                        }
                    })
                    $('#all-reports').append(`<tr id="R${1}"> 
                    <td class=""> ${val.firstname} ${val.lastname}</td>
                    <td class="">${val.attend.length}</td> 
                    <td class=""> ${lateCount}</td> 
                    <td class=""> ${excuseCount}</td> 
                     </tr>`);

                    $('#full-reports').append(`<tr id="R${1}"> 
                    <td class=""> ${val.firstname} ${val.lastname}</td>
                    <td class="">${val.attend.length}</td> 
                    <td class=""> ${lateCount}</td> 
                    <td class=""> ${excuseCount}</td> 
                    <td class=""> ${val.absent.length}</td> 
                     </tr>`);

                    $('#late-reports').append(`<tr id="R${1}"> 
                     <td class=""> ${val.firstname} ${val.lastname}</td>
                     <td class=""> ${lateCount}</td> 
                      </tr>`);

                    $('#excuse-reports').append(`<tr id="R${1}"> 
                      <td class=""> ${val.firstname} ${val.lastname}</td>
                      <td class=""> ${excuseCount}</td> 
                       </tr>`);

                    $('#brief-reports').append(`<tr id="R${1}"> 
                      <td class=""> ${val.firstname} ${val.lastname}</td>
                      <td class=""> ${val.age}</td> 
                      <td class=""> ${val.email}</td> 
                      <td class=""> ${val.address}</td> 
                       </tr>`);
                })
            }
        })

    $(function () {
        //handel logout
        const user = localStorage.getItem('user') ? localStorage.getItem('user') : null
        if ((!user || user == null) && !location.href.includes('loginemp.html')) {
            return location.replace('./loginemp.html');
        }
        //---------

        if (user && user !== '') {
            const JsonUser = JSON.parse(user)
            if (JsonUser.late && JsonUser.late.length > 0) {
                $('#isLate').css("display", "block")
            } else if (JsonUser.attend && JsonUser.attend.length > 0) {
                $('#isAttend').css("display", "block")
            } else {
                $('#isAbsent').css("display", "block")
            }
            /// setup employee monthly reports
            let lateCount = 0;
            let excuseCount = 0;
            let attendCount = JsonUser.attend.length;
            let absentCount = JsonUser.absent.length;
            $('#Attend').html(attendCount)
            $('#Absent').html(absentCount)
            JsonUser.late.forEach(val => {
                if (!val.includes('with excuse')) {
                    lateCount++
                } else {
                    excuseCount++
                }
            })
            $('#Excuse').html(excuseCount)
            $('#Late').html(lateCount)

            /// setup user profile data
            $('#profile_username').html(`Full Name: ${JsonUser.firstname}  ${JsonUser.lastname}`)
            $('#profile_address').html(`Address: ${JsonUser.address}`)
            $('#profile_age').html(`Age: ${JsonUser.age}`)
            $('#profile_email').html(`Email: ${JsonUser.email}`)
            $('#profile_role').html(`Role: ${JsonUser.role}`)

        }
    });
})
$('#logout').on('click', function () {
    return location.replace('./loginemp.html')
});