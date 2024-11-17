// import React, { useState } from 'react';

// function Login()
// {

//   const app_name = 'cop4331-3.com'
//   function buildPath(route:string) : string
//   {
//       if (process.env.NODE_ENV != 'development') 
//       {
//           return 'http://' + app_name +  ':5000/' + route;
//       }
//       else
//       {        
//           return 'http://localhost:5000/' + route;
//       }
//   }

//   const [message,setMessage] = useState('');
//   const [loginName,setLoginName] = React.useState('');
//   const [loginPassword,setPassword] = React.useState('');

//     async function doLogin(event:any) : Promise<void>
//     {
//         event.preventDefault();

//         var obj = {login:loginName,password:loginPassword};
//         var js = JSON.stringify(obj);
  
//         try
//         {    
//             const response = await fetch(buildPath('api/login'),
//                 {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});
  
//             var res = JSON.parse(await response.text());
  
//             if( res.id <= 0 )
//             {
//                 setMessage('User/Password combination incorrect');
//             }
//             else
//             {
//                 var user = {firstName:res.firstName,lastName:res.lastName,id:res.id}
//                 localStorage.setItem('user_data', JSON.stringify(user));
  
//                 setMessage('');
//                 window.location.href = '/cards';
//             }
//         }
//         catch(error:any)
//         {
//             alert(error.toString());
//             return;
//         }    
//       };

//     function handleSetLoginName( e: any ) : void
//     {
//       setLoginName( e.target.value );
//     }

//     function handleSetPassword( e: any ) : void
//     {
//       setPassword( e.target.value );
//     }

//     return(
//       <div className = "center-page">
//         <div id="loginDiv">
//           <span id="inner-title">PLEASE LOG IN</span><br />
//           Login: <input type="text" id="loginName" placeholder="Username" 
//             onChange={handleSetLoginName} /><br />
//           Password: <input type="password" id="loginPassword" placeholder="Password" 
//             onChange={handleSetPassword} />
//           <input type="submit" id="loginButton" className="buttons" value = "Do It"
//             onClick={doLogin} />
//           <span id="loginResult">{message}</span>
//         </div>
//       </div>
//     //   <div id="loginDiv">
//     //     <span id="inner-title">PLEASE LOG IN</span><br />
//     //     Login: <input type="text" id="loginName" placeholder="Username" 
//     //       onChange={handleSetLoginName} /><br />
//     //     Password: <input type="password" id="loginPassword" placeholder="Password" 
//     //       onChange={handleSetPassword} />
//     //     <input type="submit" id="loginButton" className="buttons" value = "Do It"
//     //       onClick={doLogin} />
//     //     <span id="loginResult">{message}</span>
//     //  </div>
//     );
// };

// export default Login;


import React, { useState } from 'react';
import VerifyDialog from './VerifyDialog';
import {buildPath} from '../helpers/HelperFunctions';

function Login() {

  const [message, setMessage] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setPassword] = useState('');
  const [userEmail, setUserEmail] = useState(''); 
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [token, setToken] = useState('');

  async function doLogin(event: React.FormEvent) : Promise<void> {
    event.preventDefault();

    const obj = { login: loginName, password: loginPassword };
    const js = JSON.stringify(obj);

    try {
      const response = await fetch(buildPath('api/login'), {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await response.json();

      if (res.id <= 0) {
        setMessage('User/Password combination incorrect');
      } else {
        const user = { 
          firstName: res.firstName, 
          lastName: res.lastName, 
          id: String(res.id),
          isVerified: res.isVerified,
          token: res.token,
          email: res.email
        };
        setToken(user.token);
        setUserEmail(user.email);
        localStorage.setItem('user_data', JSON.stringify(user));
        if (user.isVerified) {
          setMessage('');
          window.location.href = '/cards';
        }
        else {
          setVerifyDialogOpen(true);
        }
      }
    } catch (error: any) {
      console.error(error);
      setMessage('Error logging in. Please try again.');
    }
  }

  const handleVerifyToken = (enteredToken: string): boolean => {
    return enteredToken === token;
  };

  return (
    <div className="center-page">
      <div className="form-container">
        <h2>Login</h2>
        <form onSubmit={doLogin}>
          <input
            type="text"
            placeholder="Username"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        {message && <p>{message}</p>}
      </div>
      <VerifyDialog
        open={verifyDialogOpen}
        onClose={() => {setVerifyDialogOpen(false)}}
        onVerify={handleVerifyToken}
        login={loginName}
        password={loginPassword}
        email={userEmail} 
        verifyToken={token}
      />
    </div>
  );
}

export default Login;
