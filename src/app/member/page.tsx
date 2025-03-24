"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import styled from "@emotion/styled";

export default function Login() {
  const idRef = useRef<HTMLInputElement>(null);
  const [idFocus, set_idFocus] = useState<boolean>(false);
  const [loginData, set_loginData] = useState({
    id: "",
    password: ""
  });

  return (
    <div id="login" style={{}}>
      <div className="login-wrap">
        <h2>로그인</h2>
        <form action="">
          <div className="login-input">
            <input
              type="text"
              ref={idRef}
              onBlur={() => set_idFocus(false)}
              value={loginData.id}
              onChange={(e) =>
                set_loginData({ ...loginData, id: e.target.value })
              }
              placeholder="아이디"
            />
            <button
              type="button"
              className={`${idFocus ? "focus" : ""}`}
              onClick={() => {
                set_idFocus(true);
                setTimeout(() => {
                  if (idRef.current) {
                    idRef.current.focus();
                  }
                }, 500);
              }}
            >
              아이디
            </button>
          </div>
          <div className="login-input">
            <input type="password" placeholder="비밀번호" value={} />
          </div>
          <div>
            <button type="submit">로그인</button>
          </div>
        </form>
        <div>
          <Link href={"/member/join"}>회원가입</Link>
          <Link href={""}>아이디 찾기</Link>
          <Link href={""}>비밀번호 찾기</Link>
        </div>
      </div>
    </div>
  );
}
