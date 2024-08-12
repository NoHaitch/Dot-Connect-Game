import React from "react";
import { Link } from "react-router-dom";
import { RiArrowGoBackFill } from "react-icons/ri";
import PageTitle from "../components/PageTitle";

function NotFound() {
  return (
    <>
      <PageTitle title="Page Not Found"/>
      <div className="w-screen h-screen flex flex-col justify-center items-center space-y-6">
        <h1 className="text-red-600 text-9xl">404</h1>
        <h2 className="text-red-600 text-5xl">Page Not Found!</h2>
        <div className="h-[2px] w-[50%] bg-red-600 rounded-md"></div>
        <Link
          to="/"
          className="text-slate-800 flex flex-row justify-center items-center w-[250px] hover:text-slate-600"
        >
          <RiArrowGoBackFill className="m-2" /> Back to Home
        </Link>
      </div>
      <div className="w-screen h-screen absolute bg-black opacity-15 top-0 left-0 -z-10"></div>
    </>
  );
}

export default NotFound;
