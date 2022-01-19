FROM ubuntu:20.04

COPY download_gecko_and_mono.sh /root/download_gecko_and_mono.sh

# Install dependencies
RUN apt update \
    && apt-get update -y \
    && apt-get install --no-install-recommends --assume-yes wget software-properties-common gpg-agent supervisor xvfb mingw-w64 ffmpeg cabextract aptitude vim pulseaudio \
    && apt-get clean \
    && apt-get autoremove \
    # Install wine
    && dpkg --add-architecture i386 \
    && wget -O - https://dl.winehq.org/wine-builds/winehq.key | apt-key add - \
    && add-apt-repository 'deb https://dl.winehq.org/wine-builds/ubuntu/ bionic main' \
    && add-apt-repository ppa:cybermax-dexter/sdl2-backport \
    && aptitude install -y winehq-stable \
    # Install winetricks
    && wget -nv -O /usr/bin/winetricks https://raw.githubusercontent.com/Winetricks/winetricks/master/src/winetricks \
    && chmod +x /usr/bin/winetricks \
    # Install gecko and mono
    && chmod +x /root/download_gecko_and_mono.sh \
    && /root/download_gecko_and_mono.sh "$(dpkg -s wine-stable | grep "^Version:\s" | awk '{print $2}' | sed -E 's/~.*$//')" \
    # Install DLL
    && winetricks d3dx9_43

# Silence all fixme warnings from wine
ENV WINEDEBUG fixme-all

WORKDIR /appvm

COPY default.pa /etc/pulse/
COPY supervisord.conf /etc/supervisor/conf.d/
COPY syncinput.cpp ./syncinput.cpp

# Compile syncinput.cpp
RUN x86_64-w64-mingw32-g++ ./syncinput.cpp -o ./syncinput.exe -lws2_32 -lpthread -static

ENTRYPOINT ["supervisord"]