#include <string.h>
#include <unistd.h>
#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <linux/i2c-dev.h>
#include <sys/ioctl.h>
#include <fcntl.h>
#include <unistd.h>
 
// The PiWeather board i2c address
#define ADDRESS 0x04
 
// The I2C bus: This is for V2 pi's. For V1 Model B you need i2c-0
static const char *devName = "/dev/i2c-1";
 
int main(int argc, char** argv) {
 
  if (argc == 1) {
    printf("Supply one or more commands to send to the Arduino\n");
    exit(1);
  }
 
  printf("I2C: Connecting\n");
  int file;
 
  if ((file = open(devName, O_RDWR)) < 0) {
    fprintf(stderr, "I2C: Failed to access %d\n", devName);
    exit(1);
  }
 
  printf("I2C: acquiring buss to 0x%x\n", ADDRESS);
 
  if (ioctl(file, I2C_SLAVE, ADDRESS) < 0) {
    fprintf(stderr, "I2C: Failed to acquire bus access/talk to slave 0x%x\n", ADDRESS);
    exit(1);
  }
 
  int arg;
 
  for (arg = 1; arg < argc; arg++) {
    int val;
    int len;
    unsigned char cmd[9];
 
//	cmd = argv[arg];
    //if (0 == sscanf(argv[arg], "%s", &val)) {
    //  fprintf(stderr, "Invalid parameter %d \"%s\"\n", arg, argv[arg]);
    //  exit(1);
    //}
 
   len = strlen(argv[arg]);
    printf("Sending %s, length: %i \n", argv[arg], len);
 
    //cmd[0] = val;

if(len>6) {
	fprintf(stderr, "Parameter %s longer then 6 chars. max is 6.", argv[arg]);
	exit(1);
}
strncpy(cmd, argv[arg], len);
    if (write(file, cmd, len) == 1) {
 
      // As we are not talking to direct hardware but a microcontroller we
      // need to wait a short while so that it can respond.
      //
      // 1ms seems to be enough but it depends on what workload it has
      usleep(500000);
 
      char buf[1];
      if (read(file, buf, 1) == 1) {
    int temp = (int) buf[0];
 
    printf("Received %d\n", temp);
      }
    }
 
    // Now wait else you could crash the arduino by sending requests too fast
//    usleep(10000);
//  }
 
  close(file);
  return (EXIT_SUCCESS);
}
