import React, { useEffect, useState, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getData, postData, patchData, deleteData, getGame } from "../function/getdata";

export default function PersonalProfile() {
  const [section, setSection] = useState("review");
  const [review, setReview] = useState([]);
  const [list, setList] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const { user } = useAuth0();
  const { name , picture} = user;
  useEffect(() => {

    getData("http://localhost:4000/myrev/" + name, setReview);

  }, []);


  useEffect(() => {
    getData("http://localhost:4000/mylist/"+ name, setList)
    
    
  }, []);

  useEffect(() => {
    getData("http://localhost:4000/myevent/"+ name, setCalendar)
    
    
  }, []);
 

  const Switch = () => {
    switch (section) {
      case "review":
        return <Review review={review} setReview={setReview} />;

      case "list":
        return <List list={list} setList={setList} />;

      case "calendar":
        return <Calendar calendar={calendar} setCalendar={setCalendar}/>;

      default:
        return <Review />;
    }
  };
  
  return (
    <div className="center">
      <div className="borderbox flex">
        <img src={picture} alt="profile" className="miniimg m-10"></img>
        <div className='box-title-profile'>
          <h3 className="title-title">{name}</h3>
          
          </div>
      </div>

      <div className='box-profile-content'>
        <div className='grid-profile-content'>
        <button className='button-profile-r' onClick={() => { setSection("review");}}>
          <p className='info-button'>Recensioni</p> 
        </button>
        </div>

        <div className='grid-profile-content'>
        <button className='button-profile-d' onClick={() => {setSection("list");}}>
        <p className='info-button'>Lista desideri</p> 
        </button>
        </div>
        
        <div className='grid-profile-content'>
        <button className='button-profile-c' onClick={() => { setSection("calendar");}}>
        <p className='info-button'>Calendario</p> 
        </button>
        </div>

      </div>

      <div>
        <Switch />
      </div>
    </div>
  );
}



//sezione delle review personali

export function Review(props) {
  const inputGame = useRef("");
  const inputRev = useRef("");
  
  const { user } = useAuth0();
  const { name } = user;

const addReview =(rev)=>{
  const copyRev= props.review.slice();
  copyRev.splice(0, 0, rev);
  props.setReview(copyRev);
};

  const handleSubmit = (e) => {
    e.preventDefault();
    postData("http://localhost:4000/myrev/" + name, {
      User:name,
      Game: inputGame.current.value,
      Review: inputRev.current.value,
      Comments: "",
    });
    addReview({game: inputGame.current.value, text:inputRev.current.value, comments:[]})
  };
  return (
    <div>

      <div className='create-contenet'>
        <form className='content-review' onSubmit={handleSubmit} >
          <p className="title">What are you playing?</p>
            <div className='box'>
              <label className='button-create-review-game' >Game:</label>
              <input className='button-create-review' type="text" placeholder="Game" ref={inputGame} />
              
              <label className='button-create-review-game' >Review:</label>
              <input className='button-create-review' type="text" placeholder="Review" ref={inputRev} />
              
              <button className='button-share-post' onClick={handleSubmit}>Post</button>
            </div>
        </form>
      </div>


      <div>
        {props.review.map((rec, i) => {
          return (
            <div className="borderbox m-10" key={i}>
              <div className='p-10'>
              <h3 className='title'>{rec.game}</h3>
              <p className='text-p'>{rec.text}</p>
              </div>
              <Comments comment={rec.comments} id={i} allPost={props.review} setAllPost={props.setReview}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}


export function List(props) {
  const { user } = useAuth0();
  const { name } = user;
  const inputGame = useRef("");

  const addList =(rev)=>{
    const copyList= props.list.slice();
    copyList.splice(0, 0, rev);
    props.setList(copyList);
  };

  const deleteList =(id)=>{
    const copyList= props.list.slice();
    const newList = copyList.filter((rec)=> {return rec.id !== id});
    props.setList(newList);
  };


  
    const handleSubmit = (e) => {
      e.preventDefault();
      getGame("http://localhost:4000/gamedetail", {name: inputGame.current.value})
      .then((res) => {
      postData("http://localhost:4000/mylist/" + name, {
        User: name,
        Game: res.name,
        Img:  res.url
      });
      addList({game: res.name, url: res.url})
    })};

    const handleDelete = (id) => {

      deleteData("http://localhost:4000/mylist/" + name, {
        id: id,
      });
      deleteList(id)
    };

    
  return (
    <div>
      <div className='create-contenet'>
        <form className='content-review' onSubmit={handleSubmit}>
            <p className="title">What are you wishing for?</p>
        <div className='box'>
            <label className='button-create-review-game'>Game:</label>
            <input  className='button-create-review' type="text" placeholder="Game" ref={inputGame}/>
            <button className='button-share-post' onClick={handleSubmit}>Add</button>
            </div>
        </form>
      </div>
      <div>{props.list.map((rec,i)=>{
        return <div className="borderbox m-10" key={i}>
         <h3 className="title-game">{rec.game}</h3>
         <img src={rec.url} alt="coverGame" />
          <button onClick={()=>handleDelete(rec.id)}>Delete</button>
        </div>})}</div>
      </div>
  );
}

export  function Comments(props) {
  const { user } = useAuth0();
  const { name } = user;
  const [comment, setComment] = useState("");
  const [visible, setVisible] = useState(false);
  
  
  const postComment = (rev, comment) => {
    
    patchData("http://localhost:4000/myrev/" + name, {
      
          id: rev.id,
          fields: {
            User: name,
            Game: rev.game,
            Review: rev.text,
            Comments: comment
          }
        })
  };


  
  const addComment = (e) => {
    e.preventDefault();
    const post = props.allPost.slice();
    post[props.id].comments.push({ from: name, text: comment });
    props.setAllPost(post);
    postComment(props.allPost[props.id],JSON.stringify(props.allPost[props.id].comments))
  };

  return (
    <div className="p-10">
      <button className='button-comment'
        onClick={() => {
          setVisible(!visible);
        }}
      >
        Comment
      </button>
      {visible ? (
        <div>
          {props.comment.map((comm, id) => {
            return (
              <div key={id}>
                <h3 className='utente-comment'>{comm.from}</h3>
                <p className='text-comment'>{comm.text}</p>
              </div>
            );
          })}
          <form onSubmit={addComment}>
            <input className='box-comment'
              type="text"
              placeholder="Comment"
              onChange={(e) => {
                setComment(e.target.value);
              }}
            />
            <button className='button-send' onClick={addComment}>Send</button>
          </form>
        </div>
      ) : (
        <div />
      )}
    </div>
  );
}







export function Calendar(props) {
  
  const { user } = useAuth0();
  const { name } = user;
  const inputGame = useRef("");
  const inputDate = useRef("");

  const addList =(rev)=>{
    const copyList= props.calendar.slice();
    copyList.splice(0, 0, rev);
    props.setCalendar(copyList);
  };

  const deleteList =(id)=>{
    const copyList= props.calendar.slice();
    const newList = copyList.filter((rec)=> {return rec.id !== id});
    props.setCalendar(newList);
  };


  
    const handleSubmit = (e) => {
      e.preventDefault();
      postData("http://localhost:4000/myevent/" + name, {
        User: name,
        Dates: inputDate.current.value,
        Partecipants: JSON.stringify([]),
        Game: inputGame.current.value
       
       
      });
      addList({
        user: name,
        game: inputGame.current.value,
        date: inputDate.current.value,
        partecipants: []
      })
    };

    const handleDelete = (id) => {

      deleteData("http://localhost:4000/myevent/" + name, {
        id: id,
      });
      deleteList(id)
    };

    
  return (
    <div>
      <div className='create-contenet'>
        <form className='content-review' onSubmit={handleSubmit}>
            <p className="title">Create new appointment</p>
        <div className='box'>
            <label className='button-create-review-game'>Game:</label>
            <input  className='button-create-review' type="text" placeholder="Game" ref={inputGame}/>
            <label className='button-create-review-game'>Date:</label>
            <input  className='button-create-review' type="datetime-local" placeholder="date" ref={inputDate}/>
            <button className='button-share-post' onClick={handleSubmit}>Add</button>
            </div>
        </form>
      </div>
      <div>{props.calendar.map((ev,i)=>{
        return <div className="borderbox m-10" key={i}>
         <h3 className="title-game">{ev.game}</h3>
         <p>{ev.date}</p>
          <button onClick={()=>handleDelete(ev.id)}>Delete</button>
        </div>})}</div>
      </div>
  );
}
