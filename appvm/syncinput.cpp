#include <iostream>
#include <csignal>
#include <windows.h>
// #include <psapi.h>
#include <vector>
#include <sstream>
#include <pthread.h>
#include <ctime>
#include <chrono>

using namespace std;

int screenWidth, screenHeight;
int wineScreenWidth, wineScreenHeight;
int server; // TODO: Move to local variable
chrono::_V2::system_clock::time_point last_ping;
bool done;
HWND hwnd;
char *winTitle;
char dockerHost[20];
string hostAddr;
int hostPort;

const byte MOUSE_MOVE = 0;
const byte MOUSE_DOWN = 1;
const byte MOUSE_UP = 2;
const byte KEY_UP = 0;
const byte KEY_DOWN = 1;

string hostToIp(const string& host) {
    hostent* hostname = gethostbyname(host.c_str());
    if (hostname)
        return string(inet_ntoa(**(in_addr**)hostname->h_addr_list));
    return host;
}

int clientConnect()
{
    WSADATA wsa_data;
    SOCKADDR_IN addr;

    memset(&addr, 0, sizeof(addr));
    WSAStartup(MAKEWORD(2, 0), &wsa_data);
    int server = socket(AF_INET, SOCK_STREAM, 0);

    addr.sin_family = AF_INET;
    addr.sin_port = htons(hostPort);

    cout << "Address\n";
    cout << hostToIp(hostAddr) << ":" << hostPort << endl;
    addr.sin_addr.s_addr = inet_addr(hostToIp(hostAddr).c_str());

    cout << "Connecting to server!" << endl;
    connect(server, reinterpret_cast<SOCKADDR *>(&addr), sizeof(addr));
    cout << "Connected to server!" << endl;
    return server;
}

// get the horizontal and vertical screen sizes in pixel
void getDesktopResolution(int &width, int &height)
{
    RECT desktop;
    // Get a handle to the desktop window
    const HWND hDesktop = GetDesktopWindow();
    // Get the size of screen to the variable desktop
    GetWindowRect(hDesktop, &desktop);
    // The top left corner will have coordinates (0,0)
    // and the bottom right corner will have coordinates
    // (width, height)
    width = desktop.right;
    height = desktop.bottom;
}

HWND getWindowByTitle(char *pattern)
{
    HWND hwnd = NULL;

    do
    {
        hwnd = FindWindowEx(NULL, hwnd, NULL, NULL);
        DWORD dwPID = 0;
        GetWindowThreadProcessId(hwnd, &dwPID);
        cout << "Scanning" << hwnd << endl;
        int len = GetWindowTextLength(hwnd) + 1;

        char title[len];
        GetWindowText(hwnd, title, len);
        string st(title);
        cout << "Title : " << st << endl;

        if (st.find(pattern) != string::npos)
        {
            cout << "Found " << hwnd << endl;
            return hwnd;
        }
    } while (hwnd != 0);
    cout << "Not found" << endl;
    return hwnd; //Ignore that
}

// isDxGame use hardware keys, it's special case
HWND sendIt(int key, bool state, bool isDxGame)
{
    cout << "Sending key " << ' ' << key << endl;
    HWND temp = SetActiveWindow(hwnd);
    ShowWindow(hwnd, SW_RESTORE);
    SetFocus(hwnd);
    BringWindowToTop(hwnd);

    INPUT ip;
    ZeroMemory(&ip, sizeof(INPUT));
    // Set up a generic keyboard event.
    ip.type = INPUT_KEYBOARD;
    ip.ki.time = 0;
    ip.ki.dwExtraInfo = 0;
    if (isDxGame)
    {
        if (key == VK_UP || key == VK_DOWN || key == VK_LEFT || key == VK_RIGHT)
        {
            ip.ki.dwFlags = KEYEVENTF_EXTENDEDKEY;
            cout << "after" << key << endl;
        }
        key = MapVirtualKey(key, 0);
        ip.ki.wScan = key; // hardware scan code for key
        ip.ki.dwFlags |= KEYEVENTF_SCANCODE;
        cout << "after" << key << endl;
    }
    else
    {
        ip.ki.wVk = key; // virtual-key code for the "a" key
    }
    if (state == KEY_UP)
    {
        ip.ki.dwFlags |= KEYEVENTF_KEYUP;
    }
    SendInput(1, &ip, sizeof(INPUT));

    // ip.ki.dwFlags |= KEYEVENTF_KEYUP;
    // //cout << temp << endl;
    // SendInput(1, &ip, sizeof(INPUT));
    cout << "sended key " << ' ' << key << endl;

    return hwnd;
}

int MakeLParam(float x, float y)
{
    return int(y) << 16 | (int(x) & 0xFFFF);
}
// MouseMove function
void MouseMove(int x, int y)
{
    double fScreenWidth = GetSystemMetrics(SM_CXSCREEN) - 1;
    double fScreenHeight = GetSystemMetrics(SM_CYSCREEN) - 1;
    double fx = x * (65535.0f / fScreenWidth);
    double fy = y * (65535.0f / fScreenHeight);
    INPUT Input = {0};
    Input.type = INPUT_MOUSE;
    Input.mi.dwFlags = MOUSEEVENTF_MOVE | MOUSEEVENTF_ABSOLUTE;
    Input.mi.dx = fx;
    Input.mi.dy = fy;
    SendInput(1, &Input, sizeof(INPUT));
}

void sendMouseDown(bool isLeft, byte state, float x, float y)
{
    x *= wineScreenWidth;
    y *= wineScreenHeight;
    cout << x << ' ' << y << endl;
    INPUT Input = {0};
    ZeroMemory(&Input, sizeof(INPUT));

    MouseMove(int(x), int(y));

    if (isLeft && state == MOUSE_DOWN)
    {
        Input.mi.dwFlags = MOUSEEVENTF_LEFTDOWN | MOUSEEVENTF_ABSOLUTE;
    }
    else if (isLeft && state == MOUSE_UP)
    {
        Input.mi.dwFlags = MOUSEEVENTF_LEFTUP | MOUSEEVENTF_ABSOLUTE;
    }
    else if (!isLeft && state == MOUSE_DOWN)
    {
        Input.mi.dwFlags = MOUSEEVENTF_RIGHTDOWN | MOUSEEVENTF_ABSOLUTE;
    }
    else if (!isLeft && state == MOUSE_UP)
    {
        Input.mi.dwFlags = MOUSEEVENTF_RIGHTUP | MOUSEEVENTF_ABSOLUTE;
    }

    // left down
    Input.type = INPUT_MOUSE;
    SendInput(1, &Input, sizeof(INPUT));
}

struct Mouse
{
    byte isLeft;
    byte state;
    float x;
    float y;
    float relwidth;
    float relheight;
};

struct Key
{
    byte key;
    byte state;
};

// TODO: Use some proper serialization?
Key parseKeyPayload(string stPos)
{
    stringstream ss(stPos);

    string substr;
    getline(ss, substr, ',');
    byte key = stof(substr);

    getline(ss, substr, ',');
    byte state = stof(substr);

    return Key{key, state};
}

// TODO: Use some proper serialization?
Mouse parseMousePayload(string stPos)
{
    stringstream ss(stPos);

    string substr;
    getline(ss, substr, ',');
    bool isLeft = stof(substr);

    getline(ss, substr, ',');
    byte state = stof(substr);

    getline(ss, substr, ',');
    float x = stof(substr);

    getline(ss, substr, ',');
    float y = stof(substr);

    getline(ss, substr, ',');
    float w = stof(substr);

    getline(ss, substr, ',');
    float h = stof(substr);

    return Mouse{isLeft, state, x, y, w, h};
}

void formatWindow(HWND hwnd)
{
    SetWindowPos(hwnd, NULL, 0, 0, 800, 600, 0);
    // SetWindowLong(hwnd, GWL_STYLE, 0);
    cout << "Window formated" << endl;
}

void *thealthcheck(void *args)
{
    while (true)
    {
        cout << "Health check pipe" << endl;
        auto cur = chrono::system_clock::now();
        chrono::duration<double> elapsed_seconds = cur - last_ping;
        cout << elapsed_seconds.count() << endl;
        if (elapsed_seconds.count() > 6)
        {
            // socket is died
            cout << "Broken pipe" << endl;
            raise(SIGINT);
            return NULL;
        }
        Sleep(2000);
    }
}

void *thwndupdate(void *args)
{
    HWND oldhwnd;
    while (true)
    {
        cout << "Finding title " << winTitle << endl;
        hwnd = getWindowByTitle(winTitle);
        if (hwnd != oldhwnd)
        {
            formatWindow(hwnd);
            cout << "Updated HWND: " << hwnd << endl;
            oldhwnd = hwnd;
        }
        Sleep(2000);
    }
}

void processEvent(string ev, bool isDxGame)
{
    // Mouse payload
    if (ev[0] == 'K')
    {
        Key key = parseKeyPayload(ev.substr(1, ev.length() - 1));
        cout << "Key: " << key.key << " " << key.state << endl;
        // use key
        sendIt(key.key, key.state, isDxGame); //notepad ID
        cout << '\n'
             << "Press a key to continue...";
    }
    else if (ev[0] == 'M')
    {
        Mouse mouse = parseMousePayload(ev.substr(1, ev.length() - 1));
        float x = mouse.x;
        float y = mouse.y;
        sendMouseDown(mouse.isLeft, mouse.state, x, y);
    }
}

void exitSignalHandler(int signal) {
    exit(1);
}

int main(int argc, char *argv[])
{
    winTitle = (char *)"Notepad";
    bool isDxGame = false;
    cout << "args" << endl;
    if (argc > 1)
    {
        cout << argv[1] << endl;
        winTitle = argv[1];
    }
    if (argc > 2)
    {
        cout << argv[2] << endl;
        if (strcmp(argv[2], "game") == 0)
        {
            isDxGame = true;
        }
    }
    if (argc > 3)
    {
        cout << "HOST " << argv[3] << endl;
        hostAddr = argv[3];
    }
    if (argc > 4)
    {
        cout << "PORT " << argv[4] << endl;
        hostPort = stoi(argv[4]);
    }
    if (argc > 5)
    {
        cout << "Wine screen width " << argv[5] << endl;
        wineScreenWidth = stoi(argv[5]);
    }
    if (argc > 6)
    {
        cout << "Wine screen height " << argv[6] << endl;
        wineScreenHeight = stoi(argv[6]);
    }

    server = clientConnect();

    hwnd = 0;
    cout << "Connected " << server << endl;
    getDesktopResolution(screenWidth, screenHeight);
    cout << "width " << screenWidth << " "
         << "height " << screenHeight << endl;
    cout << "host address " << hostAddr << endl;

    formatWindow(hwnd);

    // setup socket watcher. TODO: How to check if a socket pipe is broken?
    done = false;
    last_ping = chrono::system_clock::now();
    pthread_t th1;
    pthread_t th2;

    signal(SIGINT, exitSignalHandler);

    int t1 = pthread_create(&th1, NULL, thealthcheck, NULL);
    int t2 = pthread_create(&th2, NULL, thwndupdate, NULL);

    int recv_size;
    char buf[2000];
    istringstream iss("");
    string ev;

    do
    {
        //Receive a reply from the server
        if ((recv_size = recv(server, buf, 1024, 0)) == SOCKET_ERROR)
        {
            puts("recv failed");
            Sleep(1000);
            continue;
        }

        char *buffer = new char[recv_size];
        memcpy(buffer, buf, recv_size);
        if (recv_size == 1)
        {
            if (buffer[0] == 0)
            {
                // Received ping
                last_ping = chrono::system_clock::now();
            };
        }

        try
        {
            stringstream ss(buffer);

            while (getline(ss, ev, '|'))
            {
                processEvent(ev, isDxGame);
            }
        }
        catch (const std::exception &e)
        {
            cout << "exception" << e.what() << endl;
        }
    } while (true);
    closesocket(server);
    cout << "Socket closed." << endl
         << endl;

    WSACleanup();

    return 0;
}
