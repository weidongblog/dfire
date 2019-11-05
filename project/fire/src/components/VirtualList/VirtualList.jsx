/** 
 * 虚拟列表
 * @property { list } data 所有数据
 * @property { number } itemHeight 子项高度
 * @property { number } containerHeight 容器高度
 * @property { function } visibleData 回调函数，用于更新当前列表
 * @example 
 <VirtualList
    data={[...Array(100).keys()]}
    itemHeight={50}
    visibleData={currentData => this.setState({ currentData })}
>
    <ListItem></ListItem>
    ...
</VirtualList>
 */
import React from 'react';
import './VirtualList.less';

export default class VirtualList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startOffset: 0
        };
    }

    render() {
        const { startOffset } = this.state;
        const { data, children, itemHeight, containerHeight } = this.props;
        const listHeight = data.length * itemHeight;
        return (
            <div className="fire-virtual-list-container" ref={container => this.container = container} onScroll={this.bandleScroll} style={{ height: containerHeight || "100%" }}>
                <div className="fire-virtual-list-phantom" style={{ height: listHeight }}></div>
                <div className="fire-virtual-list" style={{ transform: `translate3d(0,${startOffset}px,0)` }}>
                    {
                        children
                    }
                </div>
            </div>
        )
    }

    componentDidMount() {
        this.countVisibleData(0);
    }

    bandleScroll = e => {
        let scrollTop = e.target.scrollTop;
        this.countVisibleData(scrollTop);
    }

    countVisibleData = (scrollTop) => {
        const { data, itemHeight, containerHeight = this.container.clientHeight } = this.props;
        let visibleCount = Math.ceil(containerHeight / itemHeight) + 1;
        let startIndex = Math.floor(scrollTop / itemHeight);
        let endIndex = startIndex + visibleCount;
        this.setState({
            startOffset: scrollTop - (scrollTop % itemHeight)
        });

        this.props.visibleData && this.props.visibleData(data.slice(startIndex, endIndex));
    }
}