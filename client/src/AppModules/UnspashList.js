import React from 'react';
import { List, Button } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { loadImages } from '../Redux/actions/images';

const UnsplashList = () => {

    const images = useSelector(state => state.images);
    const dispatch = useDispatch();
    
    return (<div>
        <List

            size="small"
            dataSource={images}
            renderItem={item => (
                <List.Item style={{ display: "inline-block" }}>
                    <img src={item.urls.small} alt={item.user.username} />
                </List.Item>
            )}
        />
        <Button onClick={() => dispatch(loadImages())}>Load images</Button>
    </div>);
}

export default UnsplashList;