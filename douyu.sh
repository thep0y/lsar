#!/bin/bash
# @Author: thepoy
# @Date:   2022-01-15 20:30:45
# @Last Modified by:   thepoy
# @Last Modified time: 2022-01-15 20:34:17

room_id=$1

if [ "$room_id" = "" ]; then
    echo '需要传入房间号'
    exit 1
fi

room_info_url="https://www.douyu.com/lapi/live/getH5Play/$room_id"

curl $room_info_url