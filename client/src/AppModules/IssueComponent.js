import React from 'react';
import { List, Row, Col, Input, Radio, Button, Spin, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

import { connect } from 'react-redux';

import {
    addIssue, RemoveIssue
} from '../Redux/actions/index';

const { TextArea } = Input;
const { Text } = Typography;



class IssueComponent extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            type: 1,
            issue: "",
            loading: false,
            hasMore: true,
        }
    }

    onChange = e => {
        this.setState({
            type: e.target.value,
        });
    };

    onTextChange = e => {
        this.setState({
            issue: e.target.value,
        });
    };

    onSubmit = () => {
        this.props.addIssue({ type: this.state.type, issue: this.state.issue });
        this.setState({
            issue: "",
            type: 1,
        });
    };

    getclass(type) {
        let classType = "";
        switch (type) {
            case 1:
                classType = "danger";
                break;
            case 2:
                classType = "secondary";
                break;
            default:
                classType = "warning";
        }
        return classType;
    }

    render() {
        const { issues, RemoveIssue } = this.props;
        return (
            <div>
                <Row>
                    <Col span={8}></Col>
                    <Col span={8}>
                        Issue Tracker
                    </Col>
                    <Col span={8}></Col>
                </Row>
                <Row>
                    <Col span={8}></Col>
                    <Col span={8}>
                        <TextArea rows={4} value={this.state.issue} onChange={this.onTextChange} />
                        <Radio.Group onChange={this.onChange} value={this.state.type}>
                            <Radio value={1}>clitical</Radio>
                            <Radio value={2}>solved</Radio>
                            <Radio value={3}>info</Radio>
                        </Radio.Group>
                        <Button type="primary" onClick={this.onSubmit}>Submit</Button>
                    </Col>
                    <Col span={8}></Col>
                </Row>
                <Row>
                    <Col span={8}></Col>
                    <Col span={8}>

                        <List
                            header={<div>List of issues</div>}
                            dataSource={issues}
                            renderItem={(item, index) => (
                                <List.Item>
                                    <Text type={this.getclass(item.type)} >{item.issue}</Text>
                                    <Button shape="round" icon={<DeleteOutlined />} onClick={() => RemoveIssue(index)}></Button>
                                </List.Item>
                            )}
                        >
                            {this.state.loading && this.state.hasMore && (
                                <div className="demo-loading-container">
                                    <Spin />
                                </div>
                            )}
                        </List>

                    </Col>
                    <Col span={8}></Col>
                </Row>
            </div>
        );

    }

}

// const mapStateToProps = (state) => (
//     {
//         listData: state.listData,
//     });

const mapStateToProps = ({ issues }) => ({
    issues
});

const mapDispatchToProps = (dispatch) => ({
    addIssue: (data) => dispatch(addIssue(data)),
    RemoveIssue: (data) => dispatch(RemoveIssue(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(IssueComponent);
