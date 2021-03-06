import React, { Component } from "react";
import { Container, Nav, Button, Table, Row, Col, Modal, Form, Badge } from "react-bootstrap";
import { DefaultPlayer as Video } from 'react-html5video';
import 'react-html5video/dist/styles.css';
import axios from "axios";

axios.defaults.withCredentials = true;		// 같은 경로라고 설정하는 부분
const headers = { withCredentials: true };

class Posts extends Component {
    state = { 
        posts: [],
        register_modal_active: false,
        content_modal_active: false,
        content: {},
    };

    // Modal state function
    RegisterModalSwitch = (value) => { this.setState({ register_modal_active: value }); }
    ContentModalSwitch = (value) => { this.setState({ content_modal_active: value }); }

    componentDidMount(){
        this.LoadPosts("");
    }

    // Posts request
    LoadPosts = async (category) => {
        try {
            const post_result = await axios.post(process.env.REACT_APP_REQ_ADDRESS + "post", { category });
            if(post_result.data.resultCode) {
                this.setState({    posts: post_result.data.posts,    });
            }
        } catch (err) {
            // 에러 처리
            console.log(err);
        }
    }

    // Content request
    LoadContent = async (id) => {
        const content = this.state.posts.filter((post) => {
            return post.id === id;
        });

        await this.setState({
            content: content[0],
        });

        this.ContentModalSwitch(true);
    }

    // post register request
    PostRegister = async () => {
        const formData = new FormData();
        formData.append("headers", headers);
        formData.append("title", this._post_title.value);
        formData.append("category", this._post_category.value);
        formData.append("content", this._post_content.value);
        formData.append("video_upload", this._post_file.files[0]);

        try {
            const result = await axios.post(process.env.REACT_APP_REQ_ADDRESS + "post/register", formData);

            alert(result.data.msg);
            if(result.data.resultCode) {
                this.RegisterModalSwitch(false);
                this.LoadPosts("");    
            } else { 
                this._post_title.value = "";
                this._post_category.value = "보컬";
                this._post_content.value = "";
                this._post_file.value = "";
            }
        }catch (err) {
            // 에러 처리
            console.log(err);
        }
    }

    render (){
        // 게시글 태그 객체로 만들어 render되게 만들기
        const posts = this.state.posts.length === 0?
                    <tr><td colSpan="5">게시글이 없습니다.</td></tr> :
        			/* posts 대해 map */
                    this.state.posts.map((post) => {
                        let status;
                        /* status에 따른 처리 */
                        switch(post.status){
                            case "register": 
                                status = <Badge variant="primary">구인 중</Badge>;
                                break;

                            default:
                                break;
                        }

                        return (
                        	<tr onClick={() => this.LoadContent(post.id)} key={post.id}>
                                <td>{post.category}</td>
                                <td>{post.title}</td>
                                <td>{status}</td>
                                <td>{post.nickname}</td>
                                <td>{post.createdAt}</td>
                            </tr>
                        );    	
                    });

        let video_link = process.env.REACT_APP_REQ_ADDRESS + "video/" + this.state.content.video_file;

        return (
            <div>
                {/* posts */}
                <Container fluid>
                    <div className="mr-5 my-3 text-right"><Button onClick={() => this.RegisterModalSwitch(true)} variant="light">글 작성</Button></div>
                    <Nav justify variant="tabs" defaultActiveKey="whole" className="mx-5 mb-5">
                        <Nav.Item><Nav.Link onClick={() => this.LoadPosts("")} eventKey="whole">전체</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link onClick={() => this.LoadPosts("보컬")} eventKey="vocal">보컬</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link onClick={() => this.LoadPosts("기타")} eventKey="guitar">기타</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link onClick={() => this.LoadPosts("베이스")} eventKey="bass">베이스</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link onClick={() => this.LoadPosts("키보드")} eventKey="keyboard">키보드</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link onClick={() => this.LoadPosts("드럼")} eventKey="drum">드럼</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link onClick={() => this.LoadPosts("Etc.")} eventKey="etc">Etc.</Nav.Link></Nav.Item>
                    </Nav>
                    <Row>
                        <Table hover className="mx-5 text-center">
                            <thead>
                                <tr>
                                    <th>카테고리</th>
                                    <th>제목</th>
                                    <th>상태</th>
                                    <th>작성자</th>
                                    <th>작성일</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts}
                            </tbody>
                        </Table>
                    </Row>
                </Container>

                {/* post modal */}
                <Modal show={this.state.register_modal_active} onHide={() => this.RegisterModalSwitch(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>구인 글 작성</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group>
                                <Form.Label>제목</Form.Label>
                                <Form.Control ref={ref=>this._post_title=ref} type="text" placeholder="글 제목" />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>카테고리</Form.Label>
                                <Form.Control as="select" ref={ref=>this._post_category=ref}>
                                    <option>보컬</option>
                                    <option>기타</option>
                                    <option>베이스</option>
                                    <option>키보드</option>
                                    <option>드럼</option>
                                    <option>Etc.</option>
                                </Form.Control>
                            </Form.Group>
                            <Form.Group>
                                <Form.Control ref={ref=>this._post_content=ref} as="textarea" placeholder="글 내용" rows="5" />
                            </Form.Group>
                            <Form.Group>
                            <Form.Control type="file" ref={ref=>this._post_file=ref} placeholder="Upload" />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={this.PostRegister}>
                            등록
                        </Button>
                        <Button variant="secondary" onClick={() => this.RegisterModalSwitch(false)}>
                            취소
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* content modal */}
                <Modal show={this.state.content_modal_active} onHide={() => this.ContentModalSwitch(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title className="text-center">{this.state.content.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                            <Col>
                                {/* 비디오 재생되는 부분 */}
                                <Video autoPlay loop
                                    controls={['PlayPause', 'Seek', 'Time', 'Volume', 'Fullscreen']}
                                    onCanPlayThrough={() => {
                                        // Do stuff
                                    }}>
                                    <source src={video_link} type="video/mp4" />
                                </Video>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <h1 className="mb-5">{this.state.title}<small> - {this.state.nickname}</small></h1>
                                <p>{this.state.content.title}</p>
                                <p>{this.state.content.category}</p>
                                <p>{this.state.content.content}</p>
                                <p>{this.state.content.createdAt}</p>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => this.ContentModalSwitch(false)}>
                            닫기
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

export default Posts;